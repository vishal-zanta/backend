import mongoose, { Schema, Document } from "mongoose";

export interface IOption extends Document {
  title: string;
  type: string;
  value: string; // The snake_case version of the title
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<IOption>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure that within a specific 'type', the 'value' is unique
optionSchema.index({ type: 1, value: 1 }, { unique: true });

export const Option = mongoose.model<IOption>("Option", optionSchema);
