import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  ipAddress?: string;
  userAgent?: string;
  source?: string;
  visitedAt: Date;
}

const visitorSchema = new Schema<IVisitor>({
  ipAddress: { type: String },
  userAgent: { type: String },
  source: { type: String },
  visitedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Visitor = mongoose.model<IVisitor>('Visitor', visitorSchema);
