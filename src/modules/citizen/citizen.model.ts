import mongoose, { Schema, Document } from "mongoose";

export interface ICitizen extends Document {
  fullName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  preferredLanguage?: string;
  additionalInfo?: any;
  address?: {
    addressLine?: string;
    city?: string;
    state?: string;
    division?: mongoose.Types.ObjectId;
    district?: mongoose.Types.ObjectId;
    subdivision?: mongoose.Types.ObjectId;
    block?: mongoose.Types.ObjectId;
    panchayat?: mongoose.Types.ObjectId;
    thana?: mongoose.Types.ObjectId;
    pincode?: string;
  };
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

      address: {
        addressLine: String,
        city: String,
        state: String,
        division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division' },
        district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
        subdivision: { type: mongoose.Schema.Types.ObjectId, ref: 'Subdivision' },
        block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
        panchayat: { type: mongoose.Schema.Types.ObjectId, ref: 'Panchayat' },
        thana: { type: mongoose.Schema.Types.ObjectId, ref: 'Thana' },
        pincode: String,
      },
    
  },
  {
    timestamps: true,
  }
);

export const Citizen = mongoose.model<ICitizen>("Citizen", CitizenSchema);
