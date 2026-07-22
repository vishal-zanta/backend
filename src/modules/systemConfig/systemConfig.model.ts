import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfig extends Document {
  defaultMaxUploadSizeMB: number;
  grievanceMaxUploadSizeMB: number;
  fieldVisitMaxUploadSizeMB: number;
  chatMaxUploadSizeMB: number;
}

const systemConfigSchema = new Schema<ISystemConfig>({
  defaultMaxUploadSizeMB: { type: Number, default: 10 },
  grievanceMaxUploadSizeMB: { type: Number, default: 10 },
  fieldVisitMaxUploadSizeMB: { type: Number, default: 10 },
  chatMaxUploadSizeMB: { type: Number, default: 5 }
}, {
  timestamps: true
});

export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);
