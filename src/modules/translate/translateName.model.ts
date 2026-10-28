import mongoose, { Schema, Document } from "mongoose";

export interface ITranslateName extends Document {
  name: string;        // Original text / key
  nameHindi: string;   // Hindi version
  nameEng?: string;    // English version
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
      trim: true,
      default: "",
    },
    nameEng: {
      type: String,
      trim: true,
      default: "",
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
