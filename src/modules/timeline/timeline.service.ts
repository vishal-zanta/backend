import mongoose from "mongoose";
import { Timeline } from "./timeline.model.js";

type TimelineEventType =
  | "COMPLAINT_REGISTERED"
  | "PRIORITY_SET"
  | "ASSIGNED"
  | "SMS_SENT"
  | "FIELD_VISIT_STATUS"
  | "FIELD_VISIT_REMARK"
  | "FIELD_VISIT_SCHEDULE"
  | "ESCALATED"
  |"TRANSFERRED"
  | "RESOLVED"
  | "RESOLUTION_PHOTO"
  | "CITIZEN_FEEDBACK"
  | "COMPLAINT_CLOSED"
  | "STATUS_CHANGE";

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
  static async getTimelineHistory(grievanceId: string | mongoose.Types.ObjectId, allowedTypes?: TimelineEventType[]) {
    const query: any = { grievance: grievanceId };
    if (allowedTypes && allowedTypes.length > 0) {
      query.type = { $in: allowedTypes };
    }
    return await Timeline.find(query).sort({ createdAt: 1 });
  }
}
