import mongoose, { Schema, Document } from "mongoose";

export interface IAttachment {
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  fileName?: string;
  url?: string;
  uploadedAt: Date;
}

export interface IGrievance extends Document {
  citizen: mongoose.Types.ObjectId;
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

    grievanceId?: string;
    channel?: mongoose.Types.ObjectId;
    assignedPriority?: "NORMAL" | "URGENT" | "CRITICAL";
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
  
  rating?: number;
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

const GrievanceSchema = new Schema<IGrievance>(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      // required: true,
      index: true,
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
      urgency: {
        type: String,
        enum: ["NORMAL", "URGENT", "CRITICAL"],
        default: "NORMAL",
      },
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
        enum: ["NORMAL", "URGENT", "CRITICAL"],
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
   
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

export const Grievance = mongoose.model<IGrievance>("Grievance", GrievanceSchema);
