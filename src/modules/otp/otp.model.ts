import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  identifier: string;
  code: string;
  expiresAt: Date;
  isUsed: boolean;
}

const OtpSchema = new Schema<IOtp>(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // Auto-delete document upon expiration
    },
  },
  {
    timestamps: true,
  }
);

export const Otp = mongoose.model<IOtp>("Otp", OtpSchema);
