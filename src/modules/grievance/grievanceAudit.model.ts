import mongoose, { Schema, Document } from 'mongoose';

export interface IGrievanceAudit extends Document {
  grievance: mongoose.Types.ObjectId;
  operation: 'CREATE' | 'UPDATE';
  changes: any;
  timestamp: Date;
}

const grievanceAuditSchema = new Schema<IGrievanceAudit>({
  grievance: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Grievance', 
    required: true, 
    index: true 
  },
  operation: { 
    type: String, 
    enum: ['CREATE', 'UPDATE'], 
    required: true 
  },
  changes: { 
    type: mongoose.Schema.Types.Mixed 
  }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

export const GrievanceAudit = mongoose.model<IGrievanceAudit>('GrievanceAudit', grievanceAuditSchema);
