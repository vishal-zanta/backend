import mongoose, { Schema, Document } from "mongoose";
import { GrievanceAudit } from "./grievanceAudit.model.js";

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
    assignedPriority?: "NORMAL" | "URGENT" | "CRITICAL"|"PENDING";
    assignedOfficer?: mongoose.Types.ObjectId;
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED" | "ESCALATED" ;
    address?: {
      state?: string;
      district: mongoose.Types.ObjectId;
      subdivision?: string;
      villageOrWard?: string;
      pinCode?: string;
      landmark?: string;
    };
    escalationLevel?: number;
    geotaggedImages?: IGeotaggedImage[];
  
  rating?: number;
  feedbackText?: string;
  reOpenReason?: string;
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
        district: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Demography',
          required: true
        },
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
      reOpenReason: {
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

// Pre-save hook to capture changes before they are committed
GrievanceSchema.pre("save", function () {
  if (this.isNew) {
    this.$locals.operation = "CREATE";
    this.$locals.changes = this.toObject();
  } else {
    this.$locals.operation = "UPDATE";
    const changes: any = {};
    const modifiedPaths = this.modifiedPaths();
    for (const path of modifiedPaths) {
      if (path !== "updatedAt") {
        changes[path] = this.get(path);
      }
    }
    this.$locals.changes = changes;
  }
  
});

// Post-save hook to commit the audit log to DB
GrievanceSchema.post("save", async function (doc, next) {
  try {
    const operation = this.$locals.operation || "UPDATE";
    const changes = this.$locals.changes || {};

    if (operation === "UPDATE" && Object.keys(changes).length === 0) {
      return next();
    }

    await GrievanceAudit.create({
      grievance: doc._id,
      operation: operation as "CREATE" | "UPDATE",
      changes: changes,
    });
  } catch (error) {
    console.error("Audit Log Error (save):", error);
  }
  next();
});

// Post-findOneAndUpdate hook to capture bypass updates (like findByIdAndUpdate)
GrievanceSchema.post("findOneAndUpdate", async function (doc, next) {
  if (!doc) return next();
  try {
    const update = this.getUpdate() as any;
    let changes = update;
    
    // Extract actual $set payload if it exists to keep logs clean
    if (update && update.$set) {
      changes = update.$set;
    }

    await GrievanceAudit.create({
      grievance: doc._id,
      operation: "UPDATE",
      changes: changes,
    });
  } catch (err) {
    console.error("Audit Log Error (findOneAndUpdate):", err);
  }
  next();
});

export const Grievance = mongoose.model<IGrievance>("Grievance", GrievanceSchema);
