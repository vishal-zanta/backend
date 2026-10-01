import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { Email } from "../email/email.model.js";
import { User } from "../users/user.model.js";
import { Role } from "../roles/role.model.js";

let client: ImapFlow | null = null;
let isFetching = false;
let connectAttempts = 0;
const MAX_RETRY_DELAY = 60000; // Max 60s between retries

/**
 * Get or create a single persistent IMAP connection.
 * Returns the connected client, or null if connection fails.
 */
async function getClient(): Promise<ImapFlow | null> {
  // If we already have a working connection, reuse it
  if (client && client.usable) {
    return client;
  }

  // Clean up any stale client reference
  if (client) {
    try { client.close(); } catch (_) {}
    client = null;
  }

  const host = process.env.IMAP_HOST || "imap.hostinger.com";
  const port = Number(process.env.IMAP_PORT) || 993;

  const newClient = new ImapFlow({
    host,
    port,
    secure: port === 993,
    tls: {
      rejectUnauthorized: false,
      servername: host, // SNI - required by many hosting providers
    },
    greetingTimeout: 30000,
    socketTimeout: 60000,
    auth: {
      user: process.env.IMAP_USER || "",
      pass: process.env.IMAP_PASS || "",
    },
    logger: false,
    emitLogs: false,
  });

  // On unexpected close, clear our reference so next call reconnects
  newClient.on("close", () => {
    console.log("[IMAP] Connection closed, will reconnect on next poll.");
    if (client === newClient) {
      client = null;
    }
  });

  newClient.on("error", (err: any) => {
    // Suppress noisy logs — the catch block in fetchUnreadEmailsAndAssign handles it
    if (client === newClient) {
      client = null;
    }
  });

  try {
    await newClient.connect();
    console.log("[IMAP] Connected successfully.");
    connectAttempts = 0; // Reset on success
    client = newClient;
    return client;
  } catch (err) {
    console.error("[IMAP] Connection failed:", (err as Error).message);
    try { newClient.close(); } catch (_) {}
    connectAttempts++;
    return null;
  }
}

export const fetchUnreadEmailsAndAssign = async () => {
  // Guard: skip if already running or no credentials
  if (isFetching) return;
  if (!process.env.IMAP_USER || !process.env.IMAP_PASS) return;

  // Exponential backoff on repeated failures (5s, 10s, 20s, 40s, 60s max)
  if (connectAttempts > 0) {
    const delay = Math.min(5000 * Math.pow(2, connectAttempts - 1), MAX_RETRY_DELAY);
    // Skip this poll cycle — the setInterval will call us again
    // We track attempts in getClient() and reset on success
    if (connectAttempts > 1) {
      return; // Let the backoff timer naturally throttle via skipped cycles
    }
  }

  isFetching = true;

  try {
    const imapClient = await getClient();
    if (!imapClient) {
      return; // Connection failed, will retry next cycle
    }

    const lock = await imapClient.getMailboxLock("INBOX");
    try {
      // Fetch CCE users for round-robin assignment
      const cceRole = await Role.findOne({ level: "CCE" });
      let cceUsers: any[] = [];
      if (cceRole) {
        cceUsers = await User.find({ roles: cceRole._id, status: "ACTIVE" });
      }

      // Determine round-robin starting index
      let nextIndex = 0;
      if (cceUsers.length > 0) {
        const lastAssignedEmail = await Email.findOne({
          assignTo: { $exists: true, $ne: null },
        }).sort({ createdAt: -1 });

        if (lastAssignedEmail?.assignTo) {
          const lastIdx = cceUsers.findIndex(
            (u: any) => u._id.toString() === lastAssignedEmail.assignTo!.toString()
          );
          if (lastIdx !== -1) {
            nextIndex = (lastIdx + 1) % cceUsers.length;
          }
        }
      }

      // Step 1: Search ALL unseen message UIDs first
      const searchResult = await imapClient.search({ seen: false }, { uid: true });
      const unseenUids: number[] = Array.isArray(searchResult) ? searchResult : [];

      if (unseenUids.length === 0) {
        // No unread emails
      } else {
        console.log(`[IMAP] Found ${unseenUids.length} unseen email(s)`);

        // Step 2: Fetch each unseen email by UID
        for (const uid of unseenUids) {
          try {
            const message: any = await imapClient.fetchOne(
              uid.toString(),
              { source: true, uid: true },
              { uid: true }
            );
            if (!message?.source) continue;

            const parsed = await simpleParser(message.source);
            const messageId =
              parsed.messageId || `uid-${uid}-${Date.now()}`;

            // Skip if already saved (deduplicate by messageId)
            const existing = await Email.findOne({ messageId });
            if (existing) {
              // Already in DB, just mark as seen on server
              await imapClient.messageFlagsAdd(
                { uid: uid },
                ["\\Seen"]
              );
              continue;
            }

            // Round-robin pick
            let assignedTo = undefined;
            if (cceUsers.length > 0) {
              assignedTo = cceUsers[nextIndex]._id;
              nextIndex = (nextIndex + 1) % cceUsers.length;
            }

            // emailId auto-generates as INM-001, INM-002, etc. via pre-save hook
            const emailDoc = new Email({
              messageId,
              from:
                parsed.from?.value.map((v) => v.address).join(", ") || "",
              fromName:
                parsed.from?.value.map((v) => v.name).join(", ") || "",
              fromEmail:
                parsed.from?.value.map((v) => v.address).join(", ") || "",
              to: (Array.isArray(parsed.to) ? parsed.to : [parsed.to])
                .filter(Boolean)
                .map((t) => t!.value.map((v) => v.address).join(", "))
                .join("; ") || "",
              subject: parsed.subject || "No Subject",
              body: parsed.text || parsed.html || "",
              receivedAt: parsed.date || new Date(),
              assignTo: assignedTo,
              status: "PENDING",
            });
            await emailDoc.save();

            // Mark as seen on IMAP so we don't pull it again
            await imapClient.messageFlagsAdd({ uid: uid }, [
              "\\Seen",
            ]);
            console.log(
              `[IMAP] Saved & assigned email UID ${uid} → ${assignedTo || "unassigned"}`
            );
          } catch (msgErr: any) {
            console.error(`[IMAP] Error processing UID ${uid}:`, msgErr.message);
          }
        }
      }
    } finally {
      lock.release();
    }
  } catch (err: any) {
    console.error("[IMAP] Fetch error:", err.message || err);
    // Kill the broken connection so getClient() creates a fresh one
    if (client) {
      try { client.close(); } catch (_) {}
      client = null;
    }
  } finally {
    isFetching = false;
  }
};
