import mongoose, { Document, Schema } from "mongoose";
import { SmsNotificationType, SmsLanguage } from "./sms.types.js";

export interface ISmsLog extends Document {
  to: string;
  type: SmsNotificationType;
  category: "otp" | "citizen" | "internal";
  language: SmsLanguage;
  vars: Record<string, any>;
  status: "QUEUED" | "SENT" | "FAILED";
  gatewayResponse?: any;
  error?: string;
  attempts: number;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const smsLogSchema = new Schema<ISmsLog>(
  {
    to: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ["otp", "citizen", "internal"],
      required: true,
      index: true,
    },
    language: { type: String, default: "en" },
    vars: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["QUEUED", "SENT", "FAILED"],
      default: "QUEUED",
      index: true,
    },
    gatewayResponse: { type: Schema.Types.Mixed },
    error: { type: String },
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const SmsLog = mongoose.model<ISmsLog>("SmsLog", smsLogSchema);
