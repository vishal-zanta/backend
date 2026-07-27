import { FieldVisit } from "../modules/fieldVisit/fieldVisit.model.js";
import { Grievance } from "../modules/grievance/grievance.model.js";
import { NotificationService } from "../modules/notifications/notification.service.js";

/**
 * Runs daily at 8 AM IST.
 * Finds all field visits scheduled for today and sends a notification
 * to the assigned officer for each visit.
 */
export const sendDailyFieldVisitReminders = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Find field visits scheduled for today that are not completed or cancelled
    const todayVisits = await FieldVisit.find({
      schedule: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["PENDING", "SCHEDULED", "IN_PROGRESS"] }
    }).populate("grievance", "grievanceId assignedOfficer");

    if (!todayVisits.length) {
      console.log("[Cron] No field visits scheduled for today.");
      return;
    }

    let sentCount = 0;

    for (const visit of todayVisits) {
      const grievance = visit.grievance as any;
      if (!grievance?.assignedOfficer) continue;

      await NotificationService.sendNotification({
        recipient: grievance.assignedOfficer.toString(),
        title: "Field Visit Reminder",
        message: `You have a field visit ${visit.visitId} scheduled for today for Grievance #${grievance.grievanceId}.`,
        type: "INFO",
        referenceId: grievance._id,
        referenceModel: "Grievance",
        metadata: { visitId: visit.visitId, grievanceId: grievance.grievanceId }
      });
      sentCount++;
    }

    console.log(`[Cron] Sent ${sentCount} field visit reminder(s).`);
  } catch (error) {
    console.error("[Cron Error] sendDailyFieldVisitReminders:", error);
  }
};
