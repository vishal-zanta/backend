import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  titleHindi: string;
  department: mongoose.Types.ObjectId;
  sla: number;
  slaType?: string;
  geoTagged: boolean;
  fieldVisit: boolean;
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  sla: {
    type: Number,
    required: true,
    default: 0
  },
  slaType: String,
  geoTagged: {
    type: Boolean,
    default: false
  },
  fieldVisit: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Service = mongoose.model<IService>('Service', serviceSchema);
