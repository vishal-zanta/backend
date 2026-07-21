import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  citizenId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  grievanceId?: mongoose.Types.ObjectId;
  ipAddress: string;
  devicePlatform: string;
  endpoint: string;
  method: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  citizenId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Citizen', 
    required: false 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  grievanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grievance',
    required: false
  },
  ipAddress: { 
    type: String, 
    required: true 
  },
  devicePlatform: { 
    type: String, 
    required: true 
  },
  endpoint: { 
    type: String, 
    required: true 
  },
  method: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
