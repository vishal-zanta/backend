import mongoose, { Schema, Document } from 'mongoose';

export interface ISlaEscalation {
  role: mongoose.Types.ObjectId;
  slaHours: number;
}

export interface ISlaConfig extends Document {
  subService: mongoose.Types.ObjectId;
  escalations: ISlaEscalation[];
  officer: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const slaEscalationSchema = new Schema<ISlaEscalation>({
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  slaHours: { type: Number, required: true }
}, { _id: false });

const slaConfigSchema = new Schema<ISlaConfig>({
  subService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubService',
    required: true,
    unique: true
  },
  escalations: {
    type: [slaEscalationSchema],
    default: []
  },
  officer: {
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

export const SlaConfig = mongoose.model<ISlaConfig>('SlaConfig', slaConfigSchema);
