import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaintSource extends Document {
  title: string;
  titleHindi?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSourceSchema = new Schema<IComplaintSource>({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  titleHindi: {
    type: String,
    required: false,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const ComplaintSource = mongoose.model<IComplaintSource>('ComplaintSource', complaintSourceSchema);
