import mongoose, { Schema, Document } from 'mongoose';

export interface IExternalGrievance extends Document {
  departmentCode: string;          // e.g., "HEALTH", "PANCHAYATI_RAJ" - Determines which API to call
  externalComplaintId?: string;    // The ID returned by the external department's API (can be empty before sync)
  mobile: string;                  // Primary search key for citizens
  status: string;                  // Mapped status (e.g., "OPEN", "RESOLVED")
  
  // The magic field: Stores the exact JSON payload expected by/received from the department
  departmentPayload: Record<string, any>; 
  
  // Metadata for tracking the API request
  apiSyncStatus: "PENDING" | "SYNCED" | "FAILED";
  lastSyncAttempt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const externalGrievanceSchema = new Schema<IExternalGrievance>({
  // 1. CORE FIELDS (Strictly typed, highly indexed for fast searching)
  departmentCode: { type: String, required: true, index: true },
  externalComplaintId: { type: String, index: true }, // Not required initially, populated after sync
  mobile: { type: String, required: true, index: true },
  status: { type: String, required: true, default: "OPEN", index: true },
  
  // 2. SCHEMALESS PAYLOAD (Stores direct values, no ObjectId references)
  departmentPayload: { type: Schema.Types.Mixed, required: true },

  // 3. SYNC TRACKING
  apiSyncStatus: { 
    type: String, 
    enum: ["PENDING", "SYNCED", "FAILED"], 
    default: "PENDING", 
    index: true 
  },
  lastSyncAttempt: { type: Date }
}, {
  timestamps: true
});

// Compound index for the most common search patterns
externalGrievanceSchema.index({ mobile: 1, departmentCode: 1 });
externalGrievanceSchema.index({ externalComplaintId: 1, departmentCode: 1 });

export const ExternalGrievance = mongoose.model<IExternalGrievance>('ExternalGrievance', externalGrievanceSchema);
