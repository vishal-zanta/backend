import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { ExternalGrievance } from './externalGrievance.model.js';
import { createExternalGrievanceSchema } from './externalGrievance.validation.js';
import { ExternalIntegrationService } from './integrationFactory.js';
import { TimelineService } from '../timeline/timeline.service.js';

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
    if (mobile) query.mobile = mobile;
    if (search && typeof search === 'string') {
      query.$or = [
        { externalComplaintId: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") }
      ];
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
        const latestStatus = await ExternalIntegrationService.fetchExternalStatus(
          grievance.departmentCode,
          grievance.externalComplaintId
        );

        if (latestStatus && latestStatus !== "UNKNOWN" && latestStatus !== grievance.status) {
          const oldStatus = grievance.status;
          grievance.status = latestStatus;
          await grievance.save();

          // Log the status change in the timeline
          await TimelineService.logEvent({
            grievanceId: grievance._id as any,
            type: "STATUS_CHANGE" as any, // TimelineEventType may be an enum or specific string union
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
      } catch (error) {
        console.warn(`[ExternalGrievanceController] Live sync failed for ${grievance.externalComplaintId}`, error);
        // We do not throw here; we still want to return the local data if the external API is down.
      }
    }

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
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

    const data = await ExternalIntegrationService.fetchMasterData(String(departmentCode).toUpperCase());
    
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
}
