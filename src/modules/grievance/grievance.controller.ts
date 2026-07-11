import { Request, Response } from "express";
import { Grievance, IAttachment } from "./grievance.model.js";
import { StorageService } from "../../libs/storage.lib.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../middlewares/errorHandler.js";
import { buildPagination } from "../../utils/helpers.js";
import exifr from "exifr";

import { GrievanceService } from "./grievance.service.js";
import { SubService } from "../services/subService.model.js";
import { OfficerTagging } from "../officerTagging/officerTagging.model.js";
import { TimelineService } from "../timeline/timeline.service.js";
import { timelineTemplates } from "../timeline/timeline.template.js";

export class GrievanceController {
  
  static createGrievance = asyncHandler(async (req: Request, res: Response) => {
    const citizen = req.citizen;

    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized. Citizen not found." });
    }

    // Parse nested objects from form-data.
    // In form-data, objects like 'classification' are often sent as JSON strings.
    let classification, evidence, impact, communication, address, citizenInfo;
    console.log("Received form-data:", req.body);
    try {
      classification = typeof req.body.classification === "string" ? JSON.parse(req.body.classification) : req.body.classification;
      evidence = typeof req.body.evidence === "string" ? JSON.parse(req.body.evidence) : req.body.evidence;
      impact = typeof req.body.impact === "string" ? JSON.parse(req.body.impact) : req.body.impact;
      communication = typeof req.body.communication === "string" ? JSON.parse(req.body.communication) : req.body.communication;
      address = typeof req.body.address === "string" ? JSON.parse(req.body.address) : req.body.address;
      citizenInfo = typeof req.body.citizenInfo === "string" ? JSON.parse(req.body.citizenInfo) : req.body.citizenInfo;
    } catch (e) {
      throw new ApiError({ status: 400, message: "Invalid JSON format in form-data fields." });
    }

    if (!classification || !evidence) {
      throw new ApiError({ status: 400, message: "classification and evidence are required." });
    }

    // Hand off to the newly created service for core business logic
    const newGrievance = await GrievanceService.createGrievance({
      citizen,
      classification,
      evidence,
      impact,
      communication,
      address,
      citizenInfo,
      files: req.files as Express.Multer.File[] | undefined,
    });

    return new ApiResponse({
      res,
      status: 201,
      data: newGrievance,
      message: "Grievance submitted successfully",
    });
  });

  /**
   * Create grievance by Agent/Officer on behalf of a citizen
   */
  static createGrievanceByAgent = asyncHandler(async (req: Request, res: Response) => {
    // req.user contains the authenticated officer info
    
    // Parse nested objects from form-data.
    let classification, evidence, impact, communication, address, citizenInfo;
    try {
      classification = typeof req.body.classification === "string" ? JSON.parse(req.body.classification) : req.body.classification;
      evidence = typeof req.body.evidence === "string" ? JSON.parse(req.body.evidence) : req.body.evidence;
      impact = typeof req.body.impact === "string" ? JSON.parse(req.body.impact) : req.body.impact;
      communication = typeof req.body.communication === "string" ? JSON.parse(req.body.communication) : req.body.communication;
      address = typeof req.body.address === "string" ? JSON.parse(req.body.address) : req.body.address;
      citizenInfo = typeof req.body.citizenInfo === "string" ? JSON.parse(req.body.citizenInfo) : req.body.citizenInfo;
    } catch (e) {
      throw new ApiError({ status: 400, message: "Invalid JSON format in form-data fields." });
    }

    if (!classification || !evidence) {
      throw new ApiError({ status: 400, message: "classification and evidence are required." });
    }

    if (!citizenInfo?.mobile) {
      throw new ApiError({ status: 400, message: "citizenInfo.mobile is required when creating a grievance on behalf of a citizen." });
    }

    // Attempt to link to an existing Citizen profile if one exists for this mobile number
    let citizen;
    try {
      const { Citizen } = await import("../citizen/citizen.model.js");
      citizen = await Citizen.findOne({ mobile: citizenInfo.mobile });
    } catch (e) {
      console.warn("Could not find Citizen model to link grievance");
    }

    const newGrievance = await GrievanceService.createGrievance({
      citizen, // Will be undefined if they don't have an account yet, but mobile will be captured in citizenInfo
      classification,
      evidence,
      impact,
      communication,
      address,
      citizenInfo,
      files: req.files as Express.Multer.File[] | undefined,
      createdBy: (req as any).user._id, // Officer/Agent creating the grievance
    });

    return new ApiResponse({
      res,
      status: 201,
      data: newGrievance,
      message: "Grievance created successfully on behalf of citizen",
    });
  });

  /**
   * Get all grievances for the logged-in citizen
   */
  static getCitizenGrievances = asyncHandler(async (req: Request, res: Response) => {
    const citizen = req.citizen;
    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized. Citizen not found." });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    // Base query: Complaints linked directly to the citizen's ID OR created by an agent using their phone number
    const baseConditions = [
      { citizen: citizen._id },
      { "citizenInfo.mobile": citizen.mobile },
    ];
    // If the citizen has an alternate mobile on their profile, we can match that too
    if (citizen.alternateMobile) {
      baseConditions.push({ "citizenInfo.mobile": citizen.alternateMobile });
    }

    const query: any = {
      $or: baseConditions
    };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      const searchQuery = {
        $or: [
          { grievanceId: searchRegex },
          { "citizenInfo.mobile": searchRegex },
          { "citizenInfo.alternateMobile": searchRegex },
        ]
      };
      
      // Combine the base authorization query with the search query using $and
      query.$and = [
        { $or: baseConditions },
        searchQuery
      ];
      delete query.$or; // Remove the top-level $or since it's now inside $and
    }

    const totalCount = await Grievance.countDocuments(query);
    const pagination = buildPagination({ page, limit, totalCount });

    // Populate only the explicitly requested fields to reduce payload size
    const grievances = await Grievance.find(query)
      .select("grievanceId classification.subService address status assignedPriority createdAt")
      .populate({
        path: "classification.subService",
        select: "title titleHindi sla service",
        populate: {
          path: "service",
          select: "title titleHindi department"
        }
      })
      .skip(pagination.offset)
      .limit(pagination.limit)
      .sort({ createdAt: -1 });

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs: grievances,
        pagination,
      },
      message: "Grievances retrieved successfully",
    });
  });

  /**
   * Get single grievance details for the logged-in citizen
   */
  static getCitizenGrievanceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const citizen = req.citizen;

    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized. Citizen not found." });
    }

    const grievance = await Grievance.findById(id).populate({
      path: "classification.subService",
      populate: {
        path: "service"
      }
    });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    // Verify ownership
    const isOwner = 
      (grievance.citizen && grievance.citizen.toString() === citizen._id.toString()) ||
      (grievance.citizenInfo?.mobile === citizen.mobile) ||
      (citizen.alternateMobile && grievance.citizenInfo?.mobile === citizen.alternateMobile);

    if (!isOwner) {
      throw new ApiError({ status: 403, message: "Access denied. You do not own this grievance." });
    }

    const timeline = await TimelineService.getTimelineHistory(id);
    const responseData = {
      ...grievance.toJSON(),
      timeline,
    };

    return new ApiResponse({
      res,
      status: 200,
      data: responseData,
      message: "Grievance details retrieved successfully",
    });
  });

  /**
   * Get all grievances (for agents/admins) with search across ID, mobile, and subService name
   */
  static getAllGrievances = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      let subServiceIds: any[] = [];
      
      // Look up matching subServices by name
      try {
        
        const matchingSubServices = await SubService.find({ name: searchRegex }).select("_id");
        subServiceIds = matchingSubServices.map(s => s._id);
      } catch (e) {
        console.error("Failed to lookup SubService for search", e);
      }

      query.$or = [
        { grievanceId: searchRegex },
        { "citizenInfo.mobile": searchRegex },
        
      ];

      // If any subServices matched the search string by name, include them in the OR clause
      if (subServiceIds.length > 0) {
        query.$or.push({ "classification.subService": { $in: subServiceIds } });
      }
    }

    const totalCount = await Grievance.countDocuments(query);
    const pagination = buildPagination({ page, limit, totalCount });

    const grievances = await Grievance.find(query)
      .select("grievanceId classification.subService address status assignedPriority createdAt")
      .populate({
        path: "classification.subService",
        select: "title titleHindi sla service",
        populate: {
          path: "service",
          select: "title titleHindi department"
        }
      })
      .skip(pagination.offset)
      .limit(pagination.limit)
      .sort({ createdAt: -1 });

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs: grievances,
        pagination,
      },
      message: "All Grievances retrieved successfully",
    });
  });

  /**
   * Get all grievances assigned to the logged-in officer
   */
  static getOfficerGrievances = asyncHandler(async (req: Request, res: Response) => {
    // req.user contains the authenticated officer info
    const officerId = (req as any).user?.id;
    // console.log(req.user)
    if (!officerId) {
      throw new ApiError({ status: 401, message: "Unauthorized. Officer not found." });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    // Load Officer Tagging to see what services they handle
    let taggedServiceIds: any[] = [];
    try {
    
      const tag = await OfficerTagging.findOne({ officer: officerId, active: true });
      if (tag && tag.services) {
        taggedServiceIds = tag.services;
      }
    } catch (e) {
      console.error("Failed to load officer tags", e);
    }

    const baseConditions: any[] = [
      { assignedOfficer: officerId }
    ];

    if (taggedServiceIds.length > 0) {
      baseConditions.push({ "classification.subService": { $in: taggedServiceIds } });
    }

    const query: any = {
      $or: baseConditions
    };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      let searchSubServiceIds: any[] = [];
      
      try {
       
        const matchingSubServices = await SubService.find({ name: searchRegex }).select("_id");
        searchSubServiceIds = matchingSubServices.map(s => s._id);
      } catch (e) {}

      const searchQuery: any = {
        $or: [
          { grievanceId: searchRegex },
          { "citizenInfo.mobile": searchRegex },
        ]
      };

      if (searchSubServiceIds.length > 0) {
        searchQuery.$or.push({ "classification.subService": { $in: searchSubServiceIds } });
      }

      query.$and = [
        { $or: baseConditions },
        searchQuery
      ];
      delete query.$or;
    }

    const totalCount = await Grievance.countDocuments(query);
    const pagination = buildPagination({ page, limit, totalCount });

    const grievances = await Grievance.find(query)
      .select("grievanceId classification.subService address status assignedPriority createdAt")
      .populate({
        path: "classification.subService",
        select: "title titleHindi sla service",
        populate: {
          path: "service",
          select: "title titleHindi department"
        }
      })
      .skip(pagination.offset)
      .limit(pagination.limit)
      .sort({ createdAt: -1 });

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs: grievances,
        pagination,
      },
      message: "Assigned Grievances retrieved successfully",
    });
  });

  /**
   * Submit citizen feedback and star rating for a resolved grievance
   */
  static submitFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rating, feedbackText } = req.body;
    const citizen = req.citizen;

    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized." });
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError({ status: 400, message: "A valid star rating between 1 and 5 is required." });
    }

    const grievance = await Grievance.findById(id);

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    // Verify ownership (match citizen _id or fallback to mobile check if created by agent)
    const isOwner = grievance.citizen?.toString() === citizen._id.toString();
    const isMobileMatch = grievance.citizenInfo?.mobile === citizen.mobile;

    if (!isOwner && !isMobileMatch) {
      throw new ApiError({ status: 403, message: "You are not authorized to review this grievance." });
    }

    // Validate Status (Feedback is only for resolved/closed tickets)
    if (grievance.status !== "RESOLVED" && grievance.status !== "CLOSED") {
      throw new ApiError({ status: 400, message: "Feedback can only be submitted for RESOLVED or CLOSED grievances." });
    }

    // Prevent overriding existing feedback (immutable)
    if (grievance.rating) {
      throw new ApiError({ status: 400, message: "Feedback has already been submitted for this grievance and cannot be changed." });
    }

    grievance.rating = rating;
    grievance.feedbackText = feedbackText;

    await grievance.save();

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: "Feedback submitted successfully. Thank you!",
    });
  });

  /**
   * Update grievance details (by Officer)
   */
  static updateGrievanceByOfficer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const grievance = await Grievance.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: "Grievance updated successfully.",
    });
  });

  /**
   * Transfer grievance to another officer
   */
  static transferGrievance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { assignedOfficer } = req.body;

    if (!assignedOfficer) {
      throw new ApiError({ status: 400, message: "New assignedOfficer ID is required." });
    }

    const grievance = await Grievance.findByIdAndUpdate(
      id,
      { assignedOfficer },
      { new: true, runValidators: true }
    );

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: "Grievance transferred successfully.",
    });
  });

  /**
   * Change status of a grievance
   */
  static updateGrievanceStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ApiError({ status: 400, message: "Status is required." });
    }

    const grievance = await Grievance.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: `Grievance status changed to ${status}.`,
    });
  });

  /**
   * Change priority of a grievance
   */
  static updateGrievancePriority = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { assignedPriority } = req.body;

    if (!assignedPriority) {
      throw new ApiError({ status: 400, message: "assignedPriority is required." });
    }

    const grievance = await Grievance.findByIdAndUpdate(
      id,
      { assignedPriority },
      { new: true, runValidators: true }
    );


    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }
     await TimelineService.logEvent({
          grievanceId: grievance._id,
          type:"PRIORITY_SET",
          actor:{
            id: req.user?.id,
            name: req.user?.name || "System",
            role: req.user?.role?.level || "System",
          },
          metadata:{
            description:timelineTemplates.PRIORITY_SET(assignedPriority)
          }
        });

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: `Grievance priority changed to ${assignedPriority}.`,
    });
  });

  /**
   * Upload Geotagged images for a grievance (by Officer)
   */
  static uploadGeotaggedImages = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      throw new ApiError({ status: 400, message: "No images provided." });
    }

    const grievance: any = await Grievance.findById(id).populate("classification.subService");
    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    const isGeotagMandatory = grievance.classification?.subService?.geoTagged === true;

    const newGeotaggedImages = [];

    for (const file of req.files as Express.Multer.File[]) {
      // Only process images
      if (!file.mimetype.startsWith("image/")) {
        throw new ApiError({ status: 400, message: `File ${file.originalname} is not a valid image.` });
      }

      // Extract GPS data using exifr
      let gpsData;
      try {
        gpsData = await exifr.gps(file.buffer);
      } catch (e) {
        if (isGeotagMandatory) {
          throw new ApiError({ status: 400, message: `Failed to parse EXIF data for ${file.originalname}. Geotagging is mandatory for this service.` });
        }
      }

      if ((!gpsData || !gpsData.latitude || !gpsData.longitude) && isGeotagMandatory) {
        throw new ApiError({ 
          status: 400, 
          message: `Image ${file.originalname} is not geotagged. This service strictly requires geotagged images. Please ensure location services are enabled on your camera app.` 
        });
      }

      const ext = file.originalname.split('.').pop() || "jpg";
      const folderId = grievance.citizen?.toString() || "agent-created";
      const key = `grievances/${folderId}/geotag-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
      
      const url = await StorageService.uploadFile(key, file.buffer, file.mimetype);

      const imageRecord: any = {
        url,
        fileName: file.originalname,
        uploadedAt: new Date(),
      };

      if (gpsData && gpsData.latitude && gpsData.longitude) {
        imageRecord.coordinates = {
          latitude: gpsData.latitude,
          longitude: gpsData.longitude,
        };
      }

      newGeotaggedImages.push(imageRecord);
    }

    if (!grievance.geotaggedImages) {
      grievance.geotaggedImages = [];
    }

    grievance.geotaggedImages.push(...newGeotaggedImages);
    await grievance.save();

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: "Geotagged images uploaded and verified successfully.",
    });
  });

  /**
   * Get single grievance details (for Admin/General) without access restrictions
   */
  static getAdminGrievanceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const grievance = await Grievance.findById(id).populate({
      path: "classification.subService",
      populate: { path: "service" }
    });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    const timeline = await TimelineService.getTimelineHistory(id);
    const responseData = {
      ...grievance.toJSON(),
      timeline,
    };

    return new ApiResponse({
      res,
      status: 200,
      data: responseData,
      message: "Grievance details retrieved successfully",
    });
  });

  /**
   * Get single grievance details for the logged-in officer
   */
  static getOfficerGrievanceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const officerId = (req as any).user?.id || (req as any).user?._id;

    if (!officerId) {
      throw new ApiError({ status: 401, message: "Unauthorized. Officer not found." });
    }

    const grievance = await Grievance.findById(id).populate({
      path: "classification.subService",
      populate: { path: "service" }
    });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    // Load Officer Tagging
    let taggedServiceIds: string[] = [];
    try {
      const tag = await OfficerTagging.findOne({ officer: officerId, active: true });
      if (tag && tag.services) {
        taggedServiceIds = tag.services.map((s: any) => s.toString());
      }
    } catch (e) {
      console.error("Failed to load officer tags", e);
    }

    const grievanceSubServiceId = grievance.classification?.subService?._id?.toString() || (grievance.classification?.subService as any)?.toString();
    const assignedOfficerId = grievance.assignedOfficer?.toString();

    // Verify ownership: either explicitly assigned OR subService falls under their tags
    const isOwner = 
      (assignedOfficerId === officerId.toString()) || 
      (grievanceSubServiceId && taggedServiceIds.includes(grievanceSubServiceId));

    if (!isOwner) {
      throw new ApiError({ status: 403, message: "Access denied. This grievance is not assigned to you." });
    }

    const timeline = await TimelineService.getTimelineHistory(id);
    const responseData = {
      ...grievance.toJSON(),
      timeline,
    };

    return new ApiResponse({
      res,
      status: 200,
      data: responseData,
      message: "Grievance details retrieved successfully",
    });
  });

}
