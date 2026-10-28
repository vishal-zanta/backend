import mongoose, { Schema, Document } from "mongoose";

export interface ITranslateName extends Document {
  name: string;        // English name / text
  nameHindi: string;   // Translated Hindi version
  createdAt: Date;
  updatedAt: Date;
}

const translateNameSchema = new Schema<ITranslateName>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    nameHindi: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TranslateName = mongoose.model<ITranslateName>(
  "TranslateName",
  translateNameSchema
);
