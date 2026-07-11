import mongoose, { Document, Schema } from 'mongoose';

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
 * Get the next auto-incrementing sequence number for a given name securely.
 */
export async function getNextSequenceValue(sequenceName: string): Promise<number> {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Upsert creates the doc starting at seq: 1 if it doesn't exist
  );
  return sequenceDocument.seq;
}
