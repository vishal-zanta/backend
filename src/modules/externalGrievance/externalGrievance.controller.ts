import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { ExternalGrievance } from './externalGrievance.model.js';
import { createExternalGrievanceSchema } from './externalGrievance.validation.js';
import { ExternalIntegrationService } from './integrationFactory.js';
import { ExternalMasterDataService } from './externalMasterData.service.js';
import { syncPendingExternalGrievances } from '../../cronjobs/externalSync.cron.js';
import { TimelineService } from '../timeline/timeline.service.js';
import { timelineTemplates } from '../timeline/timeline.template.js';
import { getNextSequenceValue } from '../../utils/counter.model.js';
import { SmsService } from '../sms/sms.service.js';

export class ExternalGrievanceController {
  
  /**
   * Create a new external grievance.
   * If the external department platform is down, saves locally with PENDING status and queues for sync.
   */
  static createGrievance = asyncHandler(async (req: Request, res: Response) => {
    const validation = createExternalGrievanceSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }

    const { departmentCode, mobile, departmentPayload } = validation.data;

    // Generate internal ID: BR-YYYY-XXXXXX (6 digits sequence sharing counter with internal grievances)
    const year = new Date().getFullYear();
    const seq = await getNextSequenceValue(`grievance_${year}`);
    const internalId = `BR-${year}-${String(seq).padStart(6, "0")}`;

    // Resolve mobile number from input or payload fields
    const resolvedMobile =
      mobile ||
      departmentPayload?.mobile ||
      departmentPayload?.mobileNo ||
      departmentPayload?.complainant?.mobile ||
      departmentPayload?.citizen?.mobileNumber ||
      "";

    let externalComplaintId: string | null = null;
    let externalStatus = "PENDING";
    let apiSyncStatus: "PENDING" | "SYNCED" | "FAILED" = "PENDING";
    let lastSyncError: string | null = null;
    let extractedMobile: string | undefined = undefined;

    // 1. Attempt to call external API directly
    try {
      const result = await ExternalIntegrationService.createExternalTicket(departmentCode, departmentPayload);
      externalComplaintId = result.complaintId;
      extractedMobile = result.mobile;
      externalStatus = result.status || "OPEN";
      apiSyncStatus = "SYNCED";
    } catch (error: any) {
      console.warn(
        `[ExternalGrievance] Department ${departmentCode} API is unavailable/failed. Saving locally for deferred sync:`,
        error?.message
      );
      lastSyncError = error?.message || "External department API unreachable";
      apiSyncStatus = "PENDING";
      externalStatus = "PENDING";
    }

    // 2. Save to our local database (either as SYNCED with external ID or PENDING for retry)
    const grievance = await ExternalGrievance.create({
      internalId,
      departmentCode,
      mobile: extractedMobile || resolvedMobile,
      externalComplaintId: externalComplaintId || undefined,
      departmentPayload,
      status: externalStatus,
      apiSyncStatus,
      lastSyncAttempt: new Date(),
      syncAttempts: 1,
      lastSyncError: lastSyncError || undefined
    });

    const actorId = (req as any).user?._id || (req as any).citizen?._id || null;
    const actorName = (req as any).user?.name || (req as any).citizen?.name || "System";
    const actorRole = (req as any).user?.roles?.[0]?.level || ((req as any).citizen ? "CITIZEN" : "System");
    
    await TimelineService.logEvent({
      grievanceId: grievance._id as any,
      type: "COMPLAINT_REGISTERED",
      actor: {
        id: actorId,
        name: actorName,
        role: actorRole
      },
      metadata: {
        ...timelineTemplates.COMPLAINT_REGISTERED(internalId || grievance._id.toString(), (req as any).citizen ? "Citizen" : "System"),
        internalId,
        externalComplaintId,
        syncStatus: apiSyncStatus,
        description: apiSyncStatus === "SYNCED"
          ? `External grievance registered and synced with ${departmentCode} (ID: ${externalComplaintId}).`
          : `External department platform (${departmentCode}) is currently offline. Recorded locally as ${internalId} and queued for sync.`
      }
    });

    // Send Grievance Registration SMS to citizen using our internal grievance ID
    const targetMobile = extractedMobile || resolvedMobile;
    if (targetMobile) {
      SmsService.sendGrievanceRegistered(targetMobile, internalId).catch((err) => {
        console.error(`[ExternalGrievance] Failed to enqueue registration SMS to ${targetMobile}:`, err?.message);
      });
    }

    return new ApiResponse({
      res,
      status: 201,
      data: grievance,
      message: apiSyncStatus === "SYNCED"
        ? "External grievance created successfully and synced with department platform."
        : `External department platform is temporarily offline. Grievance recorded locally (ID: ${internalId}) and queued for automatic background sync.`
    });
  });



  /**
   * Get a list of external grievances with optional filtering and pagination
   */
  static getGrievances = asyncHandler(async (req: Request, res: Response) => {
    const { departmentCode, status, apiSyncStatus, mobile, search, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (departmentCode) query.departmentCode = departmentCode;
    if (status) query.status = status;
    if (apiSyncStatus) query.apiSyncStatus = apiSyncStatus;
    if (mobile && typeof mobile === 'string') {
      const mobileStr = mobile.slice(-10);
      query.mobile = new RegExp(`${mobileStr}$`);
    }
    if (search && typeof search === 'string') {
      const isMobileSearch = /^\d+$/.test(search) && search.length >= 10;
      const searchRegex = new RegExp(search, "i");
      
      const orConditions: any[] = [
        { externalComplaintId: searchRegex },
        { internalId: searchRegex }
      ];

      if (isMobileSearch) {
        orConditions.push({ mobile: new RegExp(`${search.slice(-10)}$`) });
      } else {
        orConditions.push({ mobile: searchRegex });
      }

      query.$or = orConditions;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [docs, total] = await Promise.all([
      ExternalGrievance.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ExternalGrievance.countDocuments(query)
    ]);

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      message: "External grievances fetched successfully."
    });
  });

  /**
   * Get a single external grievance for the logged-in citizen
   */
  static getCitizenGrievanceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const citizen = (req as any).citizen;

    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized." });
    }

    const grievance = await ExternalGrievance.findOne({
      $or: [
        { _id: id.length === 24 ? id : null },
        { externalComplaintId: id },
        { internalId: id }
      ]
    });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "External grievance not found." });
    }

    // Verify ownership
    const mobiles = [citizen.mobile.slice(-10)];
    if (citizen.alternateMobile) {
      mobiles.push(citizen.alternateMobile.slice(-10));
    }
    const isOwner = mobiles.some(mob => grievance.mobile.includes(mob));

    if (!isOwner) {
      throw new ApiError({ status: 403, message: "Access denied. You do not own this grievance." });
    }

    // Attempt live sync if it has an external ID and isn't totally closed
    if (grievance.externalComplaintId && grievance.status !== "CLOSED") {
      try {
        const result = await ExternalIntegrationService.fetchExternalStatus(
          grievance.departmentCode,
          grievance.externalComplaintId
        );

        if (result && result.status && result.status !== "UNKNOWN") {
          const latestStatus = result.status;
          let changed = false;

          if (latestStatus !== grievance.status) {
            const oldStatus = grievance.status;
            grievance.status = latestStatus;
            changed = true;

            await TimelineService.logEvent({
              grievanceId: grievance._id as any,
              type: "STATUS_CHANGE" as any,
              actor: {
                name: "System Sync",
                role: "System"
              },
              metadata: {
                description: `External department updated status from ${oldStatus} to ${latestStatus}`
              }
            });
          }

          if (result.details) {
            grievance.departmentPayload = {
              ...grievance.departmentPayload,
              ...result.details
            };
            grievance.markModified('departmentPayload');
            changed = true;
          }

          if (changed) {
            await grievance.save();
          }
        }
      } catch (error) {
        console.warn(`[ExternalGrievanceController] Live sync failed for ${grievance.externalComplaintId}`, error);
      }
    }

    const publicTimelineTypes: any[] = [
      "COMPLAINT_REGISTERED",
      "STATUS_CHANGE",
      "RESOLVED",
      "COMPLAINT_CLOSED",
      "CITIZEN_FEEDBACK",
      "RESOLUTION_PHOTO",
     
    ];
    const timeline = await TimelineService.getTimelineHistory(grievance._id as any, publicTimelineTypes);

    return new ApiResponse({
      res,
      status: 200,
      data: {
        ...grievance.toJSON(),
        timeline
      },
      message: "External grievance details fetched successfully."
    });
  });

  /**
   * Get a single external grievance by ID
   */
  static getGrievanceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Allow searching by MongoDB _id OR externalComplaintId OR internalId
    const grievance = await ExternalGrievance.findOne({
      $or: [
        { _id: id.length === 24 ? id : null },
        { externalComplaintId: id },
        { internalId: id }
      ]
    });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "External grievance not found." });
    }

    // Attempt live sync if it has an external ID and isn't totally closed
    if (grievance.externalComplaintId && grievance.status !== "CLOSED") {
      try {
        const result = await ExternalIntegrationService.fetchExternalStatus(
          grievance.departmentCode,
          grievance.externalComplaintId
        );

        if (result && result.status && result.status !== "UNKNOWN") {
          const latestStatus = result.status;
          let changed = false;

          if (latestStatus !== grievance.status) {
            const oldStatus = grievance.status;
            grievance.status = latestStatus;
            changed = true;

            // Log the status change in the timeline
            await TimelineService.logEvent({
              grievanceId: grievance._id as any,
              type: "STATUS_CHANGE" as any, 
              actor: {
                id: (req as any).user?._id || null,
                name: "System Sync",
                role: "System"
              },
              metadata: { 
                ...timelineTemplates.STATUS_CHANGE(oldStatus, latestStatus),
                oldStatus, 
                newStatus: latestStatus 
              }
            });
          }

          if (result.details) {
            grievance.departmentPayload = {
              ...grievance.departmentPayload,
              ...result.details
            };
            grievance.markModified('departmentPayload');
            changed = true;
          }

          if (changed) {
            await grievance.save();
          }
        }
      } catch (error) {
        console.warn(`[ExternalGrievanceController] Live sync failed for ${grievance.externalComplaintId}`, error);
        // We do not throw here; we still want to return the local data if the external API is down.
      }
    }

    const timeline = await TimelineService.getTimelineHistory(grievance._id as any);

    return new ApiResponse({
      res,
      status: 200,
      data: {
        ...grievance.toJSON(),
        timeline
      },
      message: "External grievance details fetched successfully."
    });
  });

  /**
   * Get master data for a specific external department.
   * Leverages local caching and fallback so dropdowns never break when external platforms are down.
   */
  static getMasterData = asyncHandler(async (req: Request, res: Response) => {
    const departmentCode = req.params.departmentCode || (req.query.departmentCode as string);
    
    if (!departmentCode) {
      throw new ApiError({ status: 400, message: "departmentCode is required" });
    }

    // Extract optional `type` and remaining query params for departments like Education/Food
    const { type, departmentCode: _ignored, ...queryParams } = req.query as Record<string, string>;

    const data = await ExternalMasterDataService.getMasterData(
      String(departmentCode).toUpperCase(),
      type,
      queryParams as Record<string, string | number>
    );
    
    return new ApiResponse({
      res,
      status: 200,
      data,
      message: `Master data for ${departmentCode} fetched successfully.`
    });
  });

  /**
   * Get district data for a specific external department with local caching.
   */
  static getDistrictData = asyncHandler(async (req: Request, res: Response) => {
    const departmentCode = req.params.departmentCode || (req.query.departmentCode as string);
    
    if (!departmentCode) {
      throw new ApiError({ status: 400, message: "departmentCode is required" });
    }

    const { departmentCode: _ignored, ...queryParams } = req.query as Record<string, string>;
    const data = await ExternalMasterDataService.getDistrictData(
      String(departmentCode).toUpperCase(),
      queryParams
    );
    
    return new ApiResponse({
      res,
      status: 200,
      data,
      message: `District data for ${departmentCode} fetched successfully.`
    });
  });

  /**
   * On-demand trigger to sync pending external grievances that failed during initial creation
   */
  static syncPendingGrievances = asyncHandler(async (req: Request, res: Response) => {
    const stats = await syncPendingExternalGrievances();
    return new ApiResponse({
      res,
      status: 200,
      data: stats,
      message: `Background sync executed. Processed: ${stats.totalProcessed}, Synced: ${stats.syncedCount}, Failed: ${stats.failedCount}`
    });
  });

  /**
   * On-demand trigger to sync and pre-cache all standalone/non-sequential master data
   */
  static syncMasterData = asyncHandler(async (req: Request, res: Response) => {
    const result = await ExternalMasterDataService.syncAllStaticData();
    return new ApiResponse({
      res,
      status: 200,
      data: result,
      message: `Master data sync completed. Synced: ${result.synced.length}, Errors: ${result.errors.length}`
    });
  });

  /**
   * Upload files to an external grievance
   */
  static uploadFiles = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Find the grievance by MongoDB _id, externalComplaintId, or internalId
    const grievance = await ExternalGrievance.findOne({
      $or: [
        { _id: id.length === 24 ? id : null },
        { externalComplaintId: id },
        { internalId: id }
      ]
    });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "External grievance not found." });
    }

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      throw new ApiError({ status: 400, message: "No files uploaded." });
    }

    if (grievance.departmentCode !== "FOOD") {
      throw new ApiError({ status: 400, message: "File upload is only supported for FOOD department currently." });
    }

    if (!grievance.externalComplaintId) {
      throw new ApiError({ status: 400, message: "External grievance ID is missing. Wait for sync." });
    }

    const files = req.files as Express.Multer.File[];
    const result = await ExternalIntegrationService.uploadExternalFiles(grievance.departmentCode, grievance.externalComplaintId, files);

    return new ApiResponse({
      res,
      status: 200,
      data: result,
      message: "Files uploaded successfully."
    });
  });
}
