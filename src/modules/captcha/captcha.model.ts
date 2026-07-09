import mongoose, { Schema, Document } from "mongoose";

export interface ICaptcha extends Document {
  captchaId: string;
  text: string;
  isUsed: boolean;
  expiresAt: Date;
}

const CaptchaSchema = new Schema<ICaptcha>(
  {
    captchaId: {
      type: String,
      required: true,
      unique: true,
    },
    text: {
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
      expires: 0, // MongoDB automatically deletes documents after this time
    },
  },
  {
    timestamps: true,
  }
);

export const Captcha = mongoose.model<ICaptcha>("Captcha", CaptchaSchema);
