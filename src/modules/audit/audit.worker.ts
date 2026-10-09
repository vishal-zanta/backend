import { Worker, Job } from "bullmq";
import { AUDIT_QUEUE_NAME } from "./audit.queue.js";
import { AuditLogDocument } from "./audit.types.js";
import {
  getOpenSearchClient,
  getMonthlyIndexName,
  ensureAuditIndexAndAlias,
} from "../../libs/opensearch.lib.js";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let parsedConnection: any = {
  host: "127.0.0.1",
  port: 6379,
};

try {
  const url = new URL(redisUrl);
  parsedConnection = {
    host: url.hostname,
    port: parseInt(url.port || "6379", 10),
    username: url.username || undefined,
    password: url.password || undefined,
  };
} catch {
  // Use default host & port
}

let auditWorker: Worker<AuditLogDocument> | null = null;

export const initAuditWorker = (): Worker<AuditLogDocument> => {
  if (auditWorker) {
    return auditWorker;
  }

  // Ensure index and aliases exist on startup
  ensureAuditIndexAndAlias().catch((err) => {
    console.warn(`[AuditWorker] OpenSearch pre-check warning: ${err.message}`);
  });

  auditWorker = new Worker<AuditLogDocument>(
    AUDIT_QUEUE_NAME,
    async (job: Job<AuditLogDocument>) => {
      const doc = job.data;
      const client = getOpenSearchClient();
      const targetIndex = getMonthlyIndexName(new Date(doc["@timestamp"] || Date.now()));

      try {
        await client.index({
          index: targetIndex,
          body: doc,
          refresh: false,
        });
      } catch (error: any) {
        console.error(`[AuditWorker] Failed to index audit document ${doc.requestId}: ${error.message}`);
        throw error; // Rethrow so BullMQ retries with exponential backoff
      }
    },
    {
      connection: parsedConnection,
      concurrency: 5,
    }
  );

  auditWorker.on("completed", (job) => {
    // Audit document processed
  });

  auditWorker.on("failed", (job, err) => {
    console.error(`[AuditWorker] Job ${job?.id} failed after attempts: ${err.message}`);
  });

  console.log("[AuditWorker] Audit worker initialized successfully.");
  return auditWorker;
};
