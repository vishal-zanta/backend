import mongoose, { Schema, Document } from 'mongoose';

export interface IExternalMasterData extends Document {
  departmentCode: string; // "HEALTH" | "EDUCATION" | "FOOD"
  dataType: string;       // "master" | "district_data" | "categories" | "types" | "states" | "districts"
  subKey: string;         // e.g. "stateId=10" or empty string ""
  data: any;              // Cached master data payload
  isStatic: boolean;      // True if standalone non-sequential data
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const externalMasterDataSchema = new Schema<IExternalMasterData>({
  departmentCode: { type: String, required: true, uppercase: true, index: true },
  dataType: { type: String, required: true, index: true },
  subKey: { type: String, default: "" },
  data: { type: Schema.Types.Mixed, required: true },
  isStatic: { type: Boolean, default: true },
  lastSyncedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

externalMasterDataSchema.index({ departmentCode: 1, dataType: 1, subKey: 1 }, { unique: true });

export const ExternalMasterData = mongoose.model<IExternalMasterData>('ExternalMasterData', externalMasterDataSchema);
