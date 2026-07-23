import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { Grievance } from './grievance.model.js';
import { GrievanceService } from './grievance.service.js';
import { createGrievanceByAgentSchema } from './grievance.validation.js';
import { ComplaintSource } from '../complaintSource/complaintSource.model.js';
import { Demography } from '../demography/demography.model.js';
import { SubService } from '../services/subService.model.js';
import { GrievanceController } from './grievance.controller.js';
import { TimelineService } from '../timeline/timeline.service.js';
import { timelineTemplates } from '../timeline/timeline.template.js';
import { FieldVisit } from '../fieldVisit/fieldVisit.model.js';
import { Service } from '../services/service.model.js';

export class ThirdPartyGrievanceController {
  
  static registerGrievance = asyncHandler(async (req: Request, res: Response) => {
    let classification, evidence, impact, communication, address, citizenInfo;
    const apiKeyDoc = (req as any).apiKey;
    
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

    const parsedBody = { classification, evidence, impact, communication, address, citizenInfo };
    const validation = createGrievanceByAgentSchema.safeParse(parsedBody);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }

    // Assign channel to a default "Third Party API" or dynamic based on api key name
    let channel = req.body.channel;
    if (!channel) {
      const dbThirdPartySourceId = await ComplaintSource.findOne({ title: RegExp(`^${apiKeyDoc.name}$`, "i") });
      if (dbThirdPartySourceId) {
        channel = dbThirdPartySourceId._id;
      }
    }

    let citizen;
    try {
      const { Citizen } = await import("../citizen/citizen.model.js");
      citizen = await Citizen.findOne({ mobile: citizenInfo.mobile });
    } catch (e) {
      console.warn("Could not find Citizen model to link grievance");
    }

    const newGrievance = await GrievanceService.createGrievance({
      citizen,
      classification,
      evidence,
      impact,
      communication,
      address,
      citizenInfo,
      channel,
      files: req.files as Express.Multer.File[] | undefined,
      createdBy: apiKeyDoc.createdBy, 
      sourceApiKey: apiKeyDoc._id,
    });

    return new ApiResponse({
      res,
      status: 201,
      data: { grievanceId: newGrievance.grievanceId, _id: newGrievance._id },
      message: "Grievance submitted successfully via Third Party API",
    });
  });

  static trackGrievances = asyncHandler(async (req: Request, res: Response) => {
    const { grievanceId, division, department, service, subService, startDate, endDate } = req.query;
    const apiKeyDoc = (req as any).apiKey;
    
    const query: any = { sourceApiKey: apiKeyDoc._id };
    if (grievanceId) {
      query.grievanceId = grievanceId;
    }
    
    if (division) {
      const divisionIds = (division as string).split(',').map(id => id.trim());
      query['address.district'] = { $in: divisionIds };
    }

    let allowedSubServiceIds: string[] | null = null;

    if (department) {
      const departmentIds = (department as string).split(',').map(id => id.trim());
      const services = await Service.find({ department: { $in: departmentIds } });
      const serviceIds = services.map(s => s._id);

      const subServices = await SubService.find({ service: { $in: serviceIds } });
      allowedSubServiceIds = subServices.map(s => s._id.toString());
    }

    if (service) {
      const serviceIds = (service as string).split(',').map(id => id.trim());
      const subServices = await SubService.find({ service: { $in: serviceIds } });
      const currentIds = subServices.map(s => s._id.toString());
      if (allowedSubServiceIds) {
        allowedSubServiceIds = allowedSubServiceIds.filter(id => currentIds.includes(id));
      } else {
        allowedSubServiceIds = currentIds;
      }
    }

    if (subService) {
      const subServiceIds = (subService as string).split(',').map(id => id.trim());
      if (allowedSubServiceIds) {
        allowedSubServiceIds = allowedSubServiceIds.filter(id => subServiceIds.includes(id));
      } else {
        allowedSubServiceIds = subServiceIds;
      }
    }

    if (allowedSubServiceIds !== null) {
      query['classification.subService'] = { $in: allowedSubServiceIds };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    } else if (!grievanceId) {
      // Default to last 1 month if no dates and no specific grievance ID are provided
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query.createdAt = { $gte: oneMonthAgo };
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Grievance.countDocuments(query);

    const grievances = await Grievance.find(query)
      .select("grievanceId status assignedPriority createdAt updatedAt citizenInfo")
      .populate("classification.subService", "title")
      .populate("address.district", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs: grievances,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: "Grievances fetched successfully",
    });
  });

  static getGrievanceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const apiKeyDoc = (req as any).apiKey;

    const grievance = await Grievance.findOne({
      $or: [{ _id: id.length === 24 ? id : null }, { grievanceId: id }],
      sourceApiKey: apiKeyDoc._id
    }).populate({
      path: "classification.subService",
      populate: { 
        path: "service",
        populate: {
          path: "department"
        }
      }
    }).populate({
      path: "assignedOfficer",
      select: "name role",
      populate: {
        path: "role"
      }
    }).populate("address.district", "name nameHindi").populate("channel","title");

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found" });
    }

    const timeline = await TimelineService.getTimelineHistory(grievance._id as any);
    const slaHours = await GrievanceController.attachSlaToGrievance(grievance);

    const responseData = {
      ...grievance.toJSON(),
      timeline,
      slaHours
    };

    return new ApiResponse({
      res,
      status: 200,
      data: responseData,
      message: "Grievance details retrieved successfully",
    });
  });

  static updateGrievanceStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Can be grievanceId string or _id
    const { status, remarks } = req.body;
    const apiKeyDoc = (req as any).apiKey;

    if (!status) {
      throw new ApiError({ status: 400, message: "Status is required." });
    }

    const oldGrievance = await Grievance.findOne({
      $or: [{ _id: id.length === 24 ? id : null }, { grievanceId: id }],
      sourceApiKey: apiKeyDoc._id
    });

    if (!oldGrievance) {
      throw new ApiError({ status: 404, message: "Grievance not found" });
    }

    if (status === "REOPENED") {
      if (oldGrievance.status !== "RESOLVED" && oldGrievance.status !== "CLOSED") {
        throw new ApiError({ status: 400, message: "A grievance can only be reopened if it is currently RESOLVED or CLOSED." });
      }
    }

    if (status === "RESOLVED") {
      const hasPhotos = oldGrievance.geotaggedImages && oldGrievance.geotaggedImages.length > 0;
      if (!hasPhotos) {
        throw new ApiError({ status: 400, message: "Cannot resolve grievance: At least one photo of the resolution is required." });
      }

      const completedVisit = await FieldVisit.findOne({ grievance: oldGrievance._id, status: 'COMPLETED' });
      if (!completedVisit) {
        throw new ApiError({ status: 400, message: "Cannot resolve grievance: A completed field visit is required before resolution." });
      }
    }

    oldGrievance.status = status;
    await oldGrievance.save();

    if (status === "RESOLVED") {
      await TimelineService.logEvent({
        grievanceId: oldGrievance._id as any,
        type: "RESOLVED",
        actor: { id: apiKeyDoc.createdBy, name: apiKeyDoc.name, role: "API_KEY" },
        metadata: { description: timelineTemplates.RESOLVED(remarks || "Grievance resolved via API.") }
      });
    } else if (status === "CLOSED") {
      const hours = Math.round((Date.now() - new Date(oldGrievance.createdAt).getTime()) / (1000 * 60 * 60));
      await TimelineService.logEvent({
        grievanceId: oldGrievance._id as any,
        type: "COMPLAINT_CLOSED",
        actor: { id: apiKeyDoc.createdBy, name: apiKeyDoc.name, role: "API_KEY" },
        metadata: { description: timelineTemplates.COMPLAINT_CLOSED(hours) }
      });
    } else {
      await TimelineService.logEvent({
        grievanceId: oldGrievance._id as any,
        type: "STATUS_CHANGE" as any,
        actor: { id: apiKeyDoc.createdBy, name: apiKeyDoc.name, role: "API_KEY" },
        metadata: { description: timelineTemplates.STATUS_CHANGE(oldGrievance.status || "UNKNOWN", status) }
      });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: oldGrievance,
      message: `Grievance status changed to ${status}.`
    });
  });

  static updateGrievancePriority = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { assignedPriority } = req.body;
    const apiKeyDoc = (req as any).apiKey;

    if (!assignedPriority) {
      throw new ApiError({ status: 400, message: "assignedPriority is required." });
    }

    const grievance = await Grievance.findOne({
      $or: [{ _id: id.length === 24 ? id : null }, { grievanceId: id }],
      sourceApiKey: apiKeyDoc._id
    });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    grievance.assignedPriority = assignedPriority;
    await grievance.save();

    await TimelineService.logEvent({
      grievanceId: grievance._id as any,
      type: "PRIORITY_SET",
      actor: { id: apiKeyDoc.createdBy, name: apiKeyDoc.name, role: "API_KEY" },
      metadata: { description: timelineTemplates.PRIORITY_SET(assignedPriority) }
    });

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: `Grievance priority changed to ${assignedPriority}.`
    });
  });
}
