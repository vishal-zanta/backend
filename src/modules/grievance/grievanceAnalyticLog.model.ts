import mongoose, { Schema, Document } from "mongoose";

export interface IGrievanceAnalyticLog extends Document {
  grievance: mongoose.Types.ObjectId;
  action: string; // e.g., "ASSIGNED", "ESCALATED"
  actionBy?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const GrievanceAnalyticLogSchema = new Schema<IGrievanceAnalyticLog>(
  {
    grievance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grievance",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const GrievanceAnalyticLog = mongoose.model<IGrievanceAnalyticLog>(
  "GrievanceAnalyticLog",
  GrievanceAnalyticLogSchema
);
