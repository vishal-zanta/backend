import { Queue, JobsOptions } from "bullmq";
import { SmsJobData, SmsPayload } from "./sms.types.js";
import { SmsLog } from "./smsLog.model.js";

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

// Queue Names
export const SMS_OTP_QUEUE = "sms-otp-queue";
export const SMS_CITIZEN_QUEUE = "sms-citizen-queue";
export const SMS_INTERNAL_QUEUE = "sms-internal-queue";

/**
 * Priority Configuration (Lower number = Higher execution priority in BullMQ)
 */
export const QUEUE_PRIORITIES = {
  OTP: 1,       // Immediate
  INTERNAL: 2,  // Officer tasks & SLA breach warnings
  CITIZEN: 3,   // Lifecycle events
};

export const smsOtpQueue = new Queue<SmsJobData>(SMS_OTP_QUEUE, {
  connection: parsedConnection,
  defaultJobOptions: {
    priority: QUEUE_PRIORITIES.OTP,
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 2000 },
    removeOnFail: { count: 5000 },
  },
});

export const smsInternalQueue = new Queue<SmsJobData>(SMS_INTERNAL_QUEUE, {
  connection: parsedConnection,
  defaultJobOptions: {
    priority: QUEUE_PRIORITIES.INTERNAL,
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 2000 },
    removeOnFail: { count: 5000 },
  },
});

export const smsCitizenQueue = new Queue<SmsJobData>(SMS_CITIZEN_QUEUE, {
  connection: parsedConnection,
  defaultJobOptions: {
    priority: QUEUE_PRIORITIES.CITIZEN,
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 2000 },
    removeOnFail: { count: 5000 },
  },
});

/**
 * Helper to record payload in database before queuing
 */
const recordSmsLog = async (
  payload: SmsPayload,
  category: "otp" | "citizen" | "internal"
): Promise<string | undefined> => {
  try {
    const log = await SmsLog.create({
      to: payload.to,
      type: payload.type,
      category,
      language: payload.language || "en",
      vars: payload.vars,
      status: "QUEUED",
      attempts: 0,
    });
    return log._id.toString();
  } catch (err: any) {
    console.warn(`[SmsQueue] Failed to create SmsLog: ${err.message}`);
    return undefined;
  }
};

/**
 * Enqueue OTP SMS
 */
export const enqueueOtpSms = async (
  payload: Omit<SmsPayload, "type"> & { vars: { OTP: string | number } },
  options?: JobsOptions
): Promise<void> => {
  try {
    const fullPayload: SmsPayload = {
      ...payload,
      type: "otp",
    };
    const logId = await recordSmsLog(fullPayload, "otp");

    await smsOtpQueue.add(
      "send_otp_sms",
      {
        ...fullPayload,
        category: "otp",
        logId,
      },
      {
        priority: QUEUE_PRIORITIES.OTP,
        ...options,
      }
    );
  } catch (error: any) {
    console.error(`[SmsQueue] Failed to enqueue OTP SMS for ${payload.to}: ${error.message}`);
  }
};

/**
 * Enqueue Citizen Notification SMS
 */
export const enqueueCitizenSms = async (
  payload: SmsPayload,
  options?: JobsOptions
): Promise<void> => {
  try {
    const logId = await recordSmsLog(payload, "citizen");

    await smsCitizenQueue.add(
      `send_citizen_${payload.type}`,
      {
        ...payload,
        category: "citizen",
        logId,
      },
      {
        priority: QUEUE_PRIORITIES.CITIZEN,
        ...options,
      }
    );
  } catch (error: any) {
    console.error(`[SmsQueue] Failed to enqueue Citizen SMS [${payload.type}] for ${payload.to}: ${error.message}`);
  }
};

/**
 * Enqueue Internal Officer Notification SMS
 */
export const enqueueInternalSms = async (
  payload: SmsPayload,
  options?: JobsOptions
): Promise<void> => {
  try {
    const logId = await recordSmsLog(payload, "internal");

    await smsInternalQueue.add(
      `send_internal_${payload.type}`,
      {
        ...payload,
        category: "internal",
        logId,
      },
      {
        priority: QUEUE_PRIORITIES.INTERNAL,
        ...options,
      }
    );
  } catch (error: any) {
    console.error(`[SmsQueue] Failed to enqueue Internal Officer SMS [${payload.type}] for ${payload.to}: ${error.message}`);
  }
};
