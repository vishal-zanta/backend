import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);
