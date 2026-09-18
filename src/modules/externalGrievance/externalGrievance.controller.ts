import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { ExternalGrievance } from './externalGrievance.model.js';
import { createExternalGrievanceSchema } from './externalGrievance.validation.js';
import { ExternalIntegrationService } from './integrationFactory.js';
import { TimelineService } from '../timeline/timeline.service.js';
import { timelineTemplates } from '../timeline/timeline.template.js';

export class ExternalGrievanceController {
  
  /**
   * Create a new external grievance.
   * This saves the dynamic payload to the DB so the cron job can push it to the external department.
   */
  static createGrievance = asyncHandler(async (req: Request, res: Response) => {
    const validation = createExternalGrievanceSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }

    const { departmentCode, mobile, departmentPayload } = validation.data;

    // 1. Call the external API directly
    const { complaintId, mobile: extractedMobile, status: externalStatus } = await ExternalIntegrationService.createExternalTicket(departmentCode, departmentPayload);

    // 2. Save to our local database with the confirmed ID
    const grievance = await ExternalGrievance.create({
      departmentCode,
      mobile: mobile || extractedMobile, // Use explicitly provided mobile or fallback to extracted
      externalComplaintId: complaintId,
      departmentPayload,
      status: externalStatus || "OPEN",
      apiSyncStatus: "PENDING" // Pending sync status
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
        description: timelineTemplates.COMPLAINT_REGISTERED(complaintId || grievance._id.toString(), (req as any).citizen ? "Citizen" : "System")
      }
    });

    return new ApiResponse({
      res,
      status: 201,
      data: grievance,
      message: "External grievance created successfully and queued for sync."
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
        { externalComplaintId: searchRegex }
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
        { externalComplaintId: id }
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
    
    // Allow searching by MongoDB _id OR externalComplaintId
    const grievance = await ExternalGrievance.findOne({
      $or: [
        { _id: id.length === 24 ? id : null },
        { externalComplaintId: id }
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
                description: `External department updated status from ${oldStatus} to ${latestStatus}`,
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
   * Get master data for a specific external department
   */
  static getMasterData = asyncHandler(async (req: Request, res: Response) => {
    const { departmentCode } = req.params;
    
    if (!departmentCode) {
      throw new ApiError({ status: 400, message: "departmentCode is required" });
    }

    // Extract optional `type` and remaining query params for departments like Education
    const { type, ...queryParams } = req.query as Record<string, string>;

    const data = await ExternalIntegrationService.fetchMasterData(
      String(departmentCode).toUpperCase(),
      type,
      queryParams as Record<string, string | number>,
    );
    
    return new ApiResponse({
      res,
      status: 200,
      data,
      message: `Master data for ${departmentCode} fetched successfully.`
    });
  });

  /**
   * Get district data for a specific external department
   */
  static getDistrictData = asyncHandler(async (req: Request, res: Response) => {
    const { departmentCode } = req.params;
    
    if (!departmentCode) {
      throw new ApiError({ status: 400, message: "departmentCode is required" });
    }

    const data = await ExternalIntegrationService.fetchDistrictData(String(departmentCode).toUpperCase());
    
    return new ApiResponse({
      res,
      status: 200,
      data,
      message: `District data for ${departmentCode} fetched successfully.`
    });
  });

  /**
   * Upload files to an external grievance
   */
  static uploadFiles = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Find the grievance by MongoDB _id or externalComplaintId
    const grievance = await ExternalGrievance.findOne({
      $or: [
        { _id: id.length === 24 ? id : null },
        { externalComplaintId: id }
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
