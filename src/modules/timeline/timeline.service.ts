import mongoose from "mongoose";
import { Timeline } from "./timeline.model.js";

type TimelineEventType =
  | "COMPLAINT_REGISTERED"
  | "PRIORITY_SET"
  | "ASSIGNED"
  | "SMS_SENT"
  | "FIELD_VISIT"
  | "ESCALATED"
  | "RESOLVED"
  | "RESOLUTION_PHOTO"
  | "CITIZEN_FEEDBACK"
  | "COMPLAINT_CLOSED";

export class TimelineService {
  /**
   * Log an event in the grievance timeline.
   */
  static async logEvent(payload: {
    grievanceId: string | mongoose.Types.ObjectId;
    type: TimelineEventType;
    actor: {
      id?: string | mongoose.Types.ObjectId;
      name: string;
      role?: string;
    };
    metadata?: any;
  }) {
    try {
      const event = await Timeline.create({
        grievance: payload.grievanceId,
        type: payload.type,
        actor: payload.actor,
        metadata: payload.metadata || {},
      });
      return event;
    } catch (error) {
      console.error("[TimelineService] Failed to log event:", error);
    }
  }

  /**
   * Get the complete timeline history for a specific grievance.
   */
  static async getTimelineHistory(grievanceId: string | mongoose.Types.ObjectId) {
    return await Timeline.find({ grievance: grievanceId }).sort({ createdAt: 1 });
  }
}
