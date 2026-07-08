import mongoose, { Schema, Document } from 'mongoose';

export interface IDemography extends Document {
  name: string;
  nameHindi: string;
  division: string;
  zone: string;
  population: number;
  urban: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const demographySchema = new Schema<IDemography>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  nameHindi: {
    type: String,
    required: true,
    trim: true
  },
  division: {
    type: String,
    required: true,
    trim: true
  },
  zone: {
    type: String,
    required: true,
    trim: true
  },
  population: {
    type: Number,
    required: true
  },
  urban: {
    type: Boolean,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Demography = mongoose.model<IDemography>('Demography', demographySchema);
