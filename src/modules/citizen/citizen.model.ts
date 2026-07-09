import mongoose, { Schema, Document } from "mongoose";

export interface ICitizen extends Document {

  fullName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  preferredLanguage?: string;
  additionalInfo?: any;
  createdAt: Date;
  updatedAt: Date;
}

const CitizenSchema = new Schema<ICitizen>(
  {
    
      fullName: {
        type: String,
        trim: true,
      },

      mobile: {
        type: String,
        required: true,
      },

      alternateMobile: {
        type: String,
        default: null,
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
        default: null,
      },

      preferredLanguage: {
        type: String,
        default: "English",
      },

      additionalInfo: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    
  },
  {
    timestamps: true,
  }
);

export const Citizen = mongoose.model<ICitizen>("Citizen", CitizenSchema);
