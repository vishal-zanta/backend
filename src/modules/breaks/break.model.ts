import mongoose, { Schema, Document } from 'mongoose';

export interface IBreak extends Document {
  user: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const breakSchema = new Schema<IBreak>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

export const Break = mongoose.model<IBreak>('Break', breakSchema);
