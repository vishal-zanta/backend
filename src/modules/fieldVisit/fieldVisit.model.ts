import mongoose, { Schema, Document } from 'mongoose';

export interface IFieldVisitLog {
  changedBy?: any;
  action: string;
  oldValue?: any;
  newValue?: any;
  changedAt: Date;
}

export interface IFieldVisit extends Document {
  visitId: string;
  grievance: mongoose.Types.ObjectId;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  schedule?: Date;
  remark?: string;
  logs: IFieldVisitLog[];
  createdAt: Date;
  updatedAt: Date;
}

const fieldVisitSchema = new Schema<IFieldVisit>({
  visitId: {
    type: String,
    required: true,
    unique: true
  },
  grievance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grievance',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS'],
    default: 'PENDING'
  },
  schedule: {
    type: Date
  },
  remark: {
    type: String
  },
  logs: [{
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const FieldVisit = mongoose.model<IFieldVisit>('FieldVisit', fieldVisitSchema);
