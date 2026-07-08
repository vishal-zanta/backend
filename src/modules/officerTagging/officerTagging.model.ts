import mongoose, { Schema, Document } from 'mongoose';

export interface IOfficerTagging extends Document {
  officer: mongoose.Types.ObjectId;
  services: mongoose.Types.ObjectId[];
  wards: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const officerTaggingSchema = new Schema<IOfficerTagging>({
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubService'
  }],
  wards: {
    type: [String],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const OfficerTagging = mongoose.model<IOfficerTagging>('OfficerTagging', officerTaggingSchema);
