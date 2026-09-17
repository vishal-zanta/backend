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
    address?: {
      isUrban?: boolean;
      addressLine?: string;
      block?: mongoose.Types.ObjectId;
      district?: mongoose.Types.ObjectId;
      panchayat?: mongoose.Types.ObjectId;
      thana?: mongoose.Types.ObjectId;
      village?: mongoose.Types.ObjectId;
      pincode?: string;
      urbanPanchayat?: mongoose.Types.ObjectId;
      ward?: mongoose.Types.ObjectId;
      landmark?: string;
    };
  };
  classification: {
    department: mongoose.Types.ObjectId;
    service: mongoose.Types.ObjectId;
    scheme?: string;
    nature: mongoose.Types.ObjectId;
    isSeasonal?: boolean;
    seasonalType?: string;
  };
  evidence: {
    details?: string;
    attachments?: IAttachment[];
  };
  impact?: {
    affectedBeneficiary: mongoose.Types.ObjectId;
    vulnerability?: {
      seniorCitizen?: boolean;
      woman?: boolean;
      personWithDisability?: boolean;
      economicallyWeakerSection?: boolean;
      general?: boolean;
    };
    publicImpact?: mongoose.Types.ObjectId;
  };
  previousReferenceGrievanceId?: mongoose.Types.ObjectId;
  communication?: {
    preferredMode?: mongoose.Types.ObjectId;
    feedbackConsent?: boolean;
    satisfactionSurveyConsent?: boolean;
  };

  grievanceId: string;
  createdBy?: mongoose.Types.ObjectId;
  sourceApiKey?: mongoose.Types.ObjectId;
  channel?: mongoose.Types.ObjectId;
  assignedPriority?: "NORMAL" | "URGENT" | "CRITICAL" ;
  assignedOfficer?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  resolvedAt?: Date;
  resolvedReason?: string;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED" | "ESCALATED";
  address?: {
    isUrban?: boolean;
    addressLine?: string;
    addressLine2?: string;
    district?: string;
    block?: string;
    panchayat?: string;
    thana?: string;
    village?: string;
    pincode?: string;
    urbanPanchayat?: string;
    ward?: string;
    state?: string;
    city?: string;
  };
  location?: {
    isUrban?: boolean;
    addressLine?: string;
    district?: mongoose.Types.ObjectId;
    block?: mongoose.Types.ObjectId;
    panchayat?: mongoose.Types.ObjectId;
    thana?: mongoose.Types.ObjectId;
    village?: mongoose.Types.ObjectId;
    pincode?: string;
    urbanPanchayat?: mongoose.Types.ObjectId;
    ward?: mongoose.Types.ObjectId;
    landmark?: string;
    state?: string;
    city?: string;
  };
  escalationLevel?: number;
  geotaggedImages?: IGeotaggedImage[];
  slaWarningSent?: boolean;

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
      address: {
      isUrban: Boolean,
      addressLine: String,
      block:{ type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
      district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
      panchayat: { type: mongoose.Schema.Types.ObjectId, ref: 'Panchayat' },
      thana: { type: mongoose.Schema.Types.ObjectId, ref: 'Thana' },
      village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
      pincode: String,
      urbanPanchayat: { type: mongoose.Schema.Types.ObjectId, ref: 'UrbanLocalBody' },
      ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward' },
      landmark: String,
    },
    },
    classification: {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
      scheme: String,
      nature: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        required: true,
      },
      isSeasonal: Boolean,
      seasonalType: String,
    },
    evidence: {
      details: {
        type: String,
      },
      attachments: [AttachmentSchema],
    },
    impact: {
  
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
        general: Boolean,
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
      default: "NORMAL",
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedReason: {
      type: String,
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
    location: {
      isUrban: Boolean,
      addressLine: String,
      district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
      block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
      panchayat: { type: mongoose.Schema.Types.ObjectId, ref: 'Panchayat' },
      thana: { type: mongoose.Schema.Types.ObjectId, ref: 'Thana' },
      village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
      pincode: String,
      urbanPanchayat: { type: mongoose.Schema.Types.ObjectId, ref: 'UrbanLocalBody' },
      ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward' },
      landmark: String,
      state: String,
      city: String,
    },
    escalationLevel: {
      type: Number,
      default: 0,
    },
    slaWarningSent: {
      type: Boolean,
      default: false,
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
    sourceApiKey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiKey",
    },
    address: {
      isUrban: Boolean,
      addressLine: String,
      addressLine2: String,
      district: String,
      block: String,
      panchayat: String,
      thana: String,
      village: String,
      pincode: String,
      urbanPanchayat: String,
      ward: String,
      state: String,
      city: String,
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
