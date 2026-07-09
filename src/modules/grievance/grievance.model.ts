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
    department: string;
    subCategory?: string;
    scheme?: string;
    service?: string;
    nature: "COMPLAINT" | "REQUEST" | "ENQUIRY" | "SUGGESTION";
    subject: string;
  };
  description: {
    details: string;
    occurrenceDate?: Date;
    issuePeriod?: string;
    frequency?: "ONE_TIME" | "RECURRING";
    attachments?: IAttachment[];
  };
  impact?: {
    urgency?: "NORMAL" | "URGENT" | "CRITICAL";
    affectedBeneficiary?: "SELF" | "FAMILY" | "COMMUNITY";
    vulnerability?: {
      seniorCitizen?: boolean;
      woman?: boolean;
      personWithDisability?: boolean;
      economicallyWeakerSection?: boolean;
    };
    publicImpact?: "INDIVIDUAL" | "COMMUNITY" | "SYSTEMIC";
  };
  previousReference?: {
    grievanceId?: string;
    submissionDate?: Date;
    department?: string;
  };
  communication?: {
    preferredMode?: "CALL" | "SMS" | "EMAIL" | "APP_NOTIFICATION";
    feedbackConsent?: boolean;
    satisfactionSurveyConsent?: boolean;
  };
  system?: {
    grievanceId?: string;
    registrationDate?: Date;
    channel?: "WEB" | "MOBILE_APP" | "CALL_CENTER" | "EMAIL" | "WHATSAPP";
    assignedPriority?: "NORMAL" | "URGENT" | "CRITICAL";
    slaHours?: number;
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
  };
  rating?: number; // Added rating
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
      required: true,
      index: true,
    },
    classification: {
      department: {
        type: String,
        required: true,
      },
      subCategory: String,
      scheme: String,
      service: String,
      nature: {
        type: String,
        enum: ["COMPLAINT", "REQUEST", "ENQUIRY", "SUGGESTION"],
        required: true,
      },
      subject: {
        type: String,
        required: true,
      },
    },
    description: {
      details: {
        type: String,
        required: true,
      },
      occurrenceDate: Date,
      issuePeriod: String,
      frequency: {
        type: String,
        enum: ["ONE_TIME", "RECURRING"],
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
        type: String,
        enum: ["SELF", "FAMILY", "COMMUNITY"],
      },
      vulnerability: {
        seniorCitizen: Boolean,
        woman: Boolean,
        personWithDisability: Boolean,
        economicallyWeakerSection: Boolean,
      },
      publicImpact: {
        type: String,
        enum: ["INDIVIDUAL", "COMMUNITY", "SYSTEMIC"],
      },
    },
    previousReference: {
      grievanceId: String,
      submissionDate: Date,
      department: String,
    },
    communication: {
      preferredMode: {
        type: String,
        enum: ["CALL", "SMS", "EMAIL", "APP_NOTIFICATION"],
      },
      feedbackConsent: Boolean,
      satisfactionSurveyConsent: Boolean,
    },
    system: {
      grievanceId: {
        type: String,
        unique: true,
        sparse: true, // It might be uniquely generated later, sparse allows multiple docs without grievanceId initially
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
      channel: {
        type: String,
        enum: ["WEB", "MOBILE_APP", "CALL_CENTER", "EMAIL", "WHATSAPP"],
      },
      assignedPriority: {
        type: String,
        enum: ["NORMAL", "URGENT", "CRITICAL"],
      },
      slaHours: Number,
      status: {
        type: String,
        enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED", "ESCALATED"],
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
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

export const Grievance = mongoose.model<IGrievance>("Grievance", GrievanceSchema);
