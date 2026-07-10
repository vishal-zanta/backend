import mongoose, { Schema, Document } from "mongoose";

export interface IAttachment {
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  fileName?: string;
  url?: string;
  uploadedAt: Date;
}

export interface IGeotaggedImage {
  url: string;
  fileName: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  uploadedAt: Date;
}

export interface IGrievance extends Document {
  citizen: mongoose.Types.ObjectId;
  citizenInfo?: {
    fullName?: string;
    mobile: string;
    alternateMobile?: string;
    email?: string;
    preferredLanguage?: string;
  };
  classification: {
    subService: mongoose.Types.ObjectId;
    scheme?: string;
    nature: mongoose.Types.ObjectId;
    subject: string;
  };
  evidence: {
    details?: string;
    occurrenceDate?: Date;
    frequency: mongoose.Types.ObjectId;
    attachments?: IAttachment[];
  };
  impact?: {
    urgency?: "NORMAL" | "URGENT" | "CRITICAL";
    affectedBeneficiary: mongoose.Types.ObjectId;
    vulnerability?: {
      seniorCitizen?: boolean;
      woman?: boolean;
      personWithDisability?: boolean;
      economicallyWeakerSection?: boolean;
    };
    publicImpact: mongoose.Types.ObjectId;
  };
  previousReferenceGrievanceId?: mongoose.Types.ObjectId;
  communication?: {
    preferredMode?: mongoose.Types.ObjectId;
    feedbackConsent?: boolean;
    satisfactionSurveyConsent?: boolean;
  };

    grievanceId: string;
    createdBy?: mongoose.Types.ObjectId;
    channel?: mongoose.Types.ObjectId;
    assignedPriority?: "NORMAL" | "URGENT" | "CRITICAL";
    assignedOfficer?: mongoose.Types.ObjectId;
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED" | "ESCALATED";
    address?: {
      state?: string;
      district?: string;
      subdivision?: string;
      villageOrWard?: string;
      pinCode?: string;
      landmark?: string;
    };
    escalationLevel?: number;
    geotaggedImages?: IGeotaggedImage[];
  
  rating?: number;
  feedbackText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    type: {
      type: String,
      enum: ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"],
    },
    fileName: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const GeotaggedImageSchema = new Schema<IGeotaggedImage>(
  {
    url: String,
    fileName: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const GrievanceSchema = new Schema<IGrievance>(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      // required: true,
      index: true,
    },
    citizenInfo: {
      fullName: String,
      mobile: { type: String, required: true },
      alternateMobile: String,
      email: String,
      preferredLanguage: String,
    },
    classification: {
      subService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubService",
        required: true,
      },
      scheme: String,
      nature: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        required: true,
      },
      subject: {
        type: String,
        required: true,
      },
    },
    evidence: {
      details: {
        type: String,
      },
      occurrenceDate: Date,
      frequency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        required: true,
      },
      attachments: [AttachmentSchema],
    },
    impact: {
      // urgency: {
      //   type: String,
      //   enum: ["NORMAL", "URGENT", "CRITICAL"],
      //   default: "NORMAL",
      // },
      affectedBeneficiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        required: true,
      },
      vulnerability: {
        seniorCitizen: Boolean,
        woman: Boolean,
        personWithDisability: Boolean,
        economicallyWeakerSection: Boolean,
      },
      publicImpact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        // required: true,
      },
    },
    previousReferenceGrievanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grievance",
    },
    communication: {
      preferredMode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ComplaintSource",
      },
      feedbackConsent: Boolean,
      satisfactionSurveyConsent: Boolean,
    },
   
      grievanceId: {
        type: String,
        unique: true,
        sparse: true, // It might be uniquely generated later, sparse allows multiple docs without grievanceId initially
      },

      channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ComplaintSource",
      },
      assignedPriority: {
        type: String,
        enum: ["NORMAL", "URGENT", "CRITICAL", "PENDING"],
        default: "PENDING",
      },
      assignedOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: [
          "OPEN",
          "IN_PROGRESS",
          "RESOLVED",
          "CLOSED",
          "REOPENED",
          "ESCALATED",
        ],
        default: "OPEN",
      },
      address: {
        state: String,
        district: String,
        subdivision: String,
        villageOrWard: String,
        pinCode: String,
        landmark: String,
      },
      escalationLevel: {
        type: Number,
        default: 0,
      },
      geotaggedImages: [GeotaggedImageSchema],
   
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedbackText: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const Grievance = mongoose.model<IGrievance>("Grievance", GrievanceSchema);
