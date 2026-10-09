import { Queue } from "bullmq";
import { AuditLogDocument } from "./audit.types.js";

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

export const AUDIT_QUEUE_NAME = "api-audit-trail-queue";

/**
 * BullMQ Queue for API Audit Events
 */
export const auditQueue = new Queue<AuditLogDocument>(AUDIT_QUEUE_NAME, {
  connection: parsedConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      count: 1000,
    },
    removeOnFail: {
      count: 5000,
    },
  },
});

/**
 * Asynchronously pushes an audit document to the queue without blocking the API
 */
export const enqueueAuditLog = async (doc: AuditLogDocument): Promise<void> => {
  try {
    await auditQueue.add("log_api_request", doc);
  } catch (err: any) {
    console.error(`[AuditQueue] Failed to enqueue audit event for ${doc.requestId}: ${err.message}`);
  }
};
