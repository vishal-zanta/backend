import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  designationEnglish: string;
  designationHindi: string;
  level: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>({
  designationEnglish: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  designationHindi: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Role = mongoose.model<IRole>('Role', roleSchema);
