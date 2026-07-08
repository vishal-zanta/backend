import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  titleHindi: string;
  department: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  titleHindi: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

serviceSchema.virtual('subservices', {
  ref: 'SubService',
  localField: '_id',
  foreignField: 'service',
  match: { active: true }
});

export const Service = mongoose.model<IService>('Service', serviceSchema);
