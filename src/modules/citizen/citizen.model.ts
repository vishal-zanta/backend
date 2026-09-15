import mongoose, { Schema, Document } from "mongoose";

export interface ICitizen extends Document {
  fullName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  preferredLanguage?: string;
  additionalInfo?: any;
  address?: {
    isUrban?: boolean;
    addressLine?: string;
    block?: mongoose.Types.ObjectId;
    district?: mongoose.Types.ObjectId;
    panchayat?: mongoose.Types.ObjectId;
    thana?: string;
    village?: mongoose.Types.ObjectId;
    pincode?: string;
    urbanPanchayat?: mongoose.Types.ObjectId;
    ward?: mongoose.Types.ObjectId;
    landmark?: string;
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
        isUrban: Boolean,
        addressLine: String,
        block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
        district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
        panchayat: { type: mongoose.Schema.Types.ObjectId, ref: 'Panchayat' },
        thana: String,
        village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
        pincode: String,
        urbanPanchayat: { type: mongoose.Schema.Types.ObjectId, ref: 'UrbanLocalBody' },
        ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward' },
        landmark: String,
      },
    
  },
  {
    timestamps: true,
  }
);

export const Citizen = mongoose.model<ICitizen>("Citizen", CitizenSchema);
