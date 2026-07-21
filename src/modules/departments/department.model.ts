import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  title: string;
  titleHindi: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  titleHindi: {
    type: String,
    // required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
