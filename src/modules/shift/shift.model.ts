import mongoose, { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<IShift>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Shift = mongoose.model<IShift>('Shift', shiftSchema);
