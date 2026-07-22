import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITimeline extends Document {
  grievance: Types.ObjectId;
  type: string;
  actor: {
    id?: Types.ObjectId;
    name: string;
    role?: string;
  };
  metadata?: any;
  createdAt: Date;
}

const TimelineSchema = new Schema<ITimeline>(
  {
    grievance: {
      type: Schema.Types.ObjectId,
      ref: "Grievance",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "COMPLAINT_REGISTERED",
        "PRIORITY_SET",
        "ASSIGNED",
        "SMS_SENT",
        "FIELD_VISIT",
        "ESCALATED",
        "TRANSFERRED",
        "RESOLVED",
        "RESOLUTION_PHOTO",
        "CITIZEN_FEEDBACK",
        "COMPLAINT_CLOSED",
        "STATUS_CHANGE",
      ],
    },
    actor: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  }
);

export const Timeline = mongoose.model<ITimeline>("Timeline", TimelineSchema);
