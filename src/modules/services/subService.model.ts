import mongoose, { Schema, Document } from 'mongoose';

export interface ISubService extends Document {
  title: string;
  titleHindi: string;
  sla: number;
  geoTagged: boolean;
  fieldVisit: boolean;
  service: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subServiceSchema = new Schema<ISubService>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleHindi: {
    type: String,
    required: true,
    trim: true
  },
  sla: {
    type: Number,
    required: true
  },
  geoTagged: {
    type: Boolean,
    default: false
  },
  fieldVisit: {
    type: Boolean,
    default: false
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const SubService = mongoose.model<ISubService>('SubService', subServiceSchema);
