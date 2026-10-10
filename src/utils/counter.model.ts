import mongoose, { Document, Schema } from 'mongoose';
import { getRedisClient, isRedisAvailable } from '../libs/redis.lib.js';

export interface ICounter extends Document<string> {
  _id: string; // The sequence name (e.g., 'grievance_2026')
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export const Counter = mongoose.model<ICounter>('Counter', counterSchema);

/**
 * Get the next auto-incrementing sequence number for a given name securely,
 * utilizing Redis atomic INCR when available and syncing to MongoDB.
 * Key formats like 'grievance_2026' naturally reset on year change.
 */
export async function getNextSequenceValue(sequenceName: string): Promise<number> {
  if (isRedisAvailable()) {
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        const redisKey = `counter:${sequenceName}`;
        const exists = await redisClient.exists(redisKey);

        if (!exists) {
          // Fetch current sequence from Mongo to seed Redis
          const [primaryDoc, extDoc] = await Promise.all([
            Counter.findById(sequenceName),
            sequenceName.startsWith("grievance_")
              ? Counter.findById(`external_${sequenceName}`)
              : Promise.resolve(null)
          ]);
          const currentSeq = Math.max(primaryDoc?.seq ?? 0, extDoc?.seq ?? 0);
          await redisClient.set(redisKey, currentSeq.toString(), { NX: true });
        }

        const nextSeq = await redisClient.incr(redisKey);

        // Synchronize MongoDB counter in the background / awaited
        await Counter.findByIdAndUpdate(
          sequenceName,
          { $set: { seq: nextSeq } },
          { new: true, upsert: true }
        );

        return nextSeq;
      }
    } catch (error) {
      console.warn(`[Counter] Redis increment failed for ${sequenceName}, falling back to MongoDB:`, error);
    }
  }

  // Fallback to direct MongoDB atomic increment
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}
