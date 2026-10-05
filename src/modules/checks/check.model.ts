import mongoose, { Schema, Document } from "mongoose";

export interface ICheck extends Document {
  name: string;
  url: string;
  status: "UP" | "DOWN";
  statusCode: number | null;
  responseTimeMs: number;
  error: string | null;
  checkedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const checkSchema = new Schema<ICheck>(
  {
    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["UP", "DOWN"],
      required: true,
      index: true,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    checkedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high performance monitoring queries
checkSchema.index({ name: 1, checkedAt: -1 });
checkSchema.index({ name: 1, status: 1, checkedAt: -1 });
checkSchema.index({ status: 1, checkedAt: -1 });

export const Check = mongoose.model<ICheck>("Check", checkSchema);
