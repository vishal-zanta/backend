import mongoose, { Schema, Document } from 'mongoose';

export interface IUlb extends Document {
  name: string;
  nameHindi: string;
  wards: number;
  district: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ulbSchema = new Schema<IUlb>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameHindi: {
    type: String,
    required: true,
    trim: true
  },
  wards: {
    type: Number,
    required: true
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Demography',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Ulb = mongoose.model<IUlb>('Ulb', ulbSchema);
