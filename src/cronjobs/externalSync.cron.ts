import { ExternalGrievance } from "../modules/externalGrievance/externalGrievance.model.js";
import { ExternalIntegrationService } from "../modules/externalGrievance/integrationFactory.js";
import { TimelineService } from "../modules/timeline/timeline.service.js";
import { SmsService } from "../modules/sms/sms.service.js";

/**
 * Background worker to sync grievances that were saved locally when external platforms were down.
 */
export const syncPendingExternalGrievances = async (): Promise<{
  totalProcessed: number;
  syncedCount: number;
  failedCount: number;
}> => {
  const pendingGrievances = await ExternalGrievance.find({
    $or: [
      { apiSyncStatus: "PENDING" },
      { apiSyncStatus: "FAILED", syncAttempts: { $lt: 25 } },
      { externalComplaintId: { $in: [null, ""] } }
    ]
  })
    .sort({ createdAt: 1 })
    .limit(25);

  let syncedCount = 0;
  let failedCount = 0;

  if (!pendingGrievances.length) {
    return { totalProcessed: 0, syncedCount: 0, failedCount: 0 };
  }

  console.log(`[ExternalSyncCron] Found ${pendingGrievances.length} pending external grievances to sync...`);

  for (const grievance of pendingGrievances) {
    try {
      console.log(`[ExternalSyncCron] Attempting sync for ${grievance.internalId || grievance._id} (${grievance.departmentCode})...`);

      const result = await ExternalIntegrationService.createExternalTicket(
        grievance.departmentCode,
        grievance.departmentPayload
      );

      grievance.externalComplaintId = result.complaintId;
      grievance.apiSyncStatus = "SYNCED";
      grievance.status = result.status || "OPEN";
      grievance.lastSyncError = undefined;
      grievance.lastSyncAttempt = new Date();
      if (!grievance.mobile && result.mobile) {
        grievance.mobile = result.mobile;
      }

      await grievance.save();
      syncedCount++;

      // Log successful sync to timeline
      await TimelineService.logEvent({
        grievanceId: grievance._id as any,
        type: "COMPLAINT_REGISTERED",
        actor: {
          name: "System Auto-Sync",
          role: "System"
        },
        metadata: {
          description: `Grievance successfully synced with external department platform (${grievance.departmentCode}). External Complaint ID: ${result.complaintId}`,
          internalId: grievance.internalId,
          externalComplaintId: result.complaintId,
          syncStatus: "SYNCED"
        }
      });

      console.log(`[ExternalSyncCron] Successfully synced ${grievance.internalId} -> External ID: ${result.complaintId}`);
    } catch (error: any) {
      failedCount++;
      const attempts = (grievance.syncAttempts || 0) + 1;
      grievance.syncAttempts = attempts;
      grievance.lastSyncError = error?.message || "External API sync failed";
      grievance.lastSyncAttempt = new Date();

      if (attempts >= 25) {
        grievance.apiSyncStatus = "FAILED";
      } else {
        grievance.apiSyncStatus = "PENDING";
      }

      await grievance.save();
      console.warn(`[ExternalSyncCron] Failed to sync ${grievance.internalId} (Attempt ${attempts}):`, error?.message);
    }
  }

  return {
    totalProcessed: pendingGrievances.length,
    syncedCount,
    failedCount
  };
};
