import { Worker, Job } from "bullmq";
import {
  SMS_OTP_QUEUE,
  SMS_CITIZEN_QUEUE,
  SMS_INTERNAL_QUEUE,
} from "./sms.queue.js";
import { SmsJobData } from "./sms.types.js";
import { SmsClient } from "./sms.client.js";
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

let otpWorker: Worker<SmsJobData> | null = null;
let citizenWorker: Worker<SmsJobData> | null = null;
let internalWorker: Worker<SmsJobData> | null = null;

/**
 * Worker job processor: Hits external SMS gateway with payload and updates DB log
 */
const processSmsJob = async (job: Job<SmsJobData>) => {
  const data = job.data;
  console.log(`[SmsWorker] Dispatching ${data.category.toUpperCase()} SMS [${data.type}] to ${data.to}...`);

  try {
    const response = await SmsClient.send({
      to: data.to,
      type: data.type,
      language: data.language || "en",
      vars: data.vars,
    });

    if (data.logId) {
      await SmsLog.findByIdAndUpdate(data.logId, {
        status: "SENT",
        gatewayResponse: response,
        sentAt: new Date(),
        $inc: { attempts: 1 },
      }).catch(() => {});
    }

    console.log(`[SmsWorker] Successfully dispatched ${data.category.toUpperCase()} SMS [${data.type}] to ${data.to}`);
    return response;
  } catch (error: any) {
    if (data.logId) {
      await SmsLog.findByIdAndUpdate(data.logId, {
        status: job.attemptsMade + 1 >= (job.opts.attempts || 3) ? "FAILED" : "QUEUED",
        error: error.message,
        $inc: { attempts: 1 },
      }).catch(() => {});
    }
    throw error; // Rethrow to trigger BullMQ retry backoff
  }
};

/**
 * Initialize all three SMS workers:
 * 1. OTP Worker: Concurrency 10 (Fast & Immediate dispatch)
 * 2. Internal Officer Worker: Concurrency 5
 * 3. Citizen Notifications Worker: Concurrency 5
 */
export const initSmsWorkers = () => {
  if (!otpWorker) {
    otpWorker = new Worker<SmsJobData>(SMS_OTP_QUEUE, processSmsJob, {
      connection: parsedConnection,
      concurrency: 10,
    });

    otpWorker.on("completed", (job) => {
      console.log(`[SmsWorker:OTP] Completed job ${job.id} for ${job.data.to}`);
    });

    otpWorker.on("failed", (job, err) => {
      console.error(`[SmsWorker:OTP] Failed job ${job?.id} for ${job?.data.to}: ${err.message}`);
    });
  }

  if (!internalWorker) {
    internalWorker = new Worker<SmsJobData>(SMS_INTERNAL_QUEUE, processSmsJob, {
      connection: parsedConnection,
      concurrency: 5,
    });

    internalWorker.on("completed", (job) => {
      console.log(`[SmsWorker:INTERNAL] Completed job ${job.id} for ${job.data.to}`);
    });

    internalWorker.on("failed", (job, err) => {
      console.error(`[SmsWorker:INTERNAL] Failed job ${job?.id} for ${job?.data.to}: ${err.message}`);
    });
  }

  if (!citizenWorker) {
    citizenWorker = new Worker<SmsJobData>(SMS_CITIZEN_QUEUE, processSmsJob, {
      connection: parsedConnection,
      concurrency: 5,
    });

    citizenWorker.on("completed", (job) => {
      console.log(`[SmsWorker:CITIZEN] Completed job ${job.id} for ${job.data.to}`);
    });

    citizenWorker.on("failed", (job, err) => {
      console.error(`[SmsWorker:CITIZEN] Failed job ${job?.id} for ${job?.data.to}: ${err.message}`);
    });
  }

  console.log("[SmsWorker] OTP, Internal, and Citizen SMS Workers initialized successfully.");
  return { otpWorker, internalWorker, citizenWorker };
};
