import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  designationEnglish: string;
  designationHindi: string;
  level: string;
  active: boolean;
  department: mongoose.Types.ObjectId;
  permissions: string[];
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
  permissions: {
    type: [String],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  }
}, {
  timestamps: true
});

export const Role = mongoose.model<IRole>('Role', roleSchema);
