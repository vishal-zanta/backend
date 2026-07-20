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
import { GrievanceAnalyticLog } from "./grievanceAnalyticLog.model.js";
import { ComplaintSource } from "../complaintSource/complaintSource.model.js";
import { createGrievanceSchema, createGrievanceByAgentSchema, submitFeedbackSchema, reopenGrievanceSchema } from "./grievance.validation.js";
import { User } from "../users/user.model.js";
import { FieldVisit } from '../fieldVisit/fieldVisit.model.js';
import { Option } from "../options/option.model.js";
import { Demography } from "../demography/demography.model.js";

export class GrievanceController {
  private static async validateReferences(data: any) {
    const checks: Promise<any>[] = [];
    
    if (data.classification?.subService) {
      checks.push(SubService.exists({ _id: data.classification.subService }).then(exists => {
        if (!exists) throw new ApiError({ status: 400, message: "Invalid classification.subService: Reference does not exist" });
      }));
    }
    if (data.classification?.nature) {
      checks.push(Option.exists({ _id: data.classification.nature }).then(exists => {
        if (!exists) throw new ApiError({ status: 400, message: "Invalid classification.nature: Reference does not exist" });
      }));
    }
    if (data.evidence?.frequency) {
      checks.push(Option.exists({ _id: data.evidence.frequency }).then(exists => {
        if (!exists) throw new ApiError({ status: 400, message: "Invalid evidence.frequency: Reference does not exist" });
      }));
    }
    if (data.address?.district) {
      checks.push(Demography.exists({ _id: data.address.district }).then(exists => {
        if (!exists) throw new ApiError({ status: 400, message: "Invalid address.district: Reference does not exist" });
      }));
    }
    if (data.impact?.affectedBeneficiary) {
      checks.push(Option.exists({ _id: data.impact.affectedBeneficiary }).then(exists => {
        if (!exists) throw new ApiError({ status: 400, message: "Invalid impact.affectedBeneficiary: Reference does not exist" });
      }));
    }
    if (data.impact?.publicImpact) {
      checks.push(Option.exists({ _id: data.impact.publicImpact }).then(exists => {
        if (!exists) throw new ApiError({ status: 400, message: "Invalid impact.publicImpact: Reference does not exist" });
      }));
    }
    if (data.communication?.preferredMode) {
      checks.push(ComplaintSource.exists({ _id: data.communication.preferredMode }).then(exists => {
        if (!exists) throw new ApiError({ status: 400, message: "Invalid communication.preferredMode: Reference does not exist" });
      }));
    }

    await Promise.all(checks);
  }

  
  static createGrievance = asyncHandler(async (req: Request, res: Response) => {
    const citizen = req.citizen;

    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized. Citizen not found." });
    }

    // Parse nested objects from form-data.
    // In form-data, objects like 'classification' are often sent as JSON strings.
    let classification, evidence, impact, communication, address, citizenInfo;
    const dbWebsiteSourceId=await ComplaintSource.findOne({title:RegExp("^website$", "i")})
    const channel = dbWebsiteSourceId;
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

    // Force the mobile number to be the logged-in citizen's real mobile
    if (!citizenInfo) citizenInfo = {};
    citizenInfo.mobile = citizen.mobile;

    const parsedBody = { classification, evidence, impact, communication, address, citizenInfo };
    const validation = createGrievanceSchema.safeParse(parsedBody);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }

    await GrievanceController.validateReferences(parsedBody);

    // Hand off to the newly created service for core business logic
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
    const channel = req.body.channel;
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

    await GrievanceController.validateReferences(parsedBody);

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
      channel,
      files: req.files as Express.Multer.File[] | undefined,
      createdBy: (req as any).user.id, // Officer/Agent creating the grievance
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
    const status=(req.query.status as string) ||null
const citizenMobile = citizen.mobile.slice(-10);
const alternateMobile = citizen?.alternateMobile?.slice(-10);
    // Base query: Complaints linked directly to the citizen's ID OR created by an agent using their phone number
    const baseConditions = [
      { citizen: citizen._id },
      { "citizenInfo.mobile": citizenMobile },
    ];
    // If the citizen has an alternate mobile on their profile, we can match that too
    if (alternateMobile) {
      baseConditions.push({ "citizenInfo.mobile": alternateMobile });
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
    if (status) {
  query.status = {
    $in: status.split(",")
  };
}

    const totalCount = await Grievance.countDocuments(query);
    const pagination = buildPagination({ page, limit, totalCount });

    // Populate only the explicitly requested fields to reduce payload size
    const grievances = await Grievance.find(query)
      .select("grievanceId classification.subService address status assignedPriority createdAt feedbackText rating")
      .populate({
        path: "classification.subService",
        select: "title titleHindi sla service",
        populate: {
          path: "service",
          select: "title titleHindi department"
        }
      })
      .populate("address.district", "name nameHindi")
      .sort({ createdAt: -1 })
      .skip(pagination.offset)
      .limit(pagination.limit);

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
    }).populate({
      path: "assignedOfficer",
      select: "name role",
      populate: {
        path: "role"
      }
    }).populate("address.district", "name nameHindi");

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }
const citizenMobile = citizen.mobile.slice(-10);
const alternateMobile = citizen?.alternateMobile?.slice(-10);
    // Verify ownership
    const isOwner = 
      (grievance.citizen && grievance.citizen.toString() === citizen._id.toString()) ||
      (grievance.citizenInfo?.mobile === citizenMobile) ||
      (citizen.alternateMobile && grievance.citizenInfo?.mobile === alternateMobile);

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
   * Get dashboard analytics for admin
   */
  static getAdminDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { filter = "week" } = req.query;

    let currentStart = new Date();
    let lastStart = new Date();
    const now = new Date();

    if (filter === "week") {
      currentStart.setDate(now.getDate() - 7);
      lastStart.setDate(now.getDate() - 14);
    } else if (filter === "month") {
      currentStart.setMonth(now.getMonth() - 1);
      lastStart.setMonth(now.getMonth() - 2);
    } else if (filter === "year") {
      currentStart.setFullYear(now.getFullYear() - 1);
      lastStart.setFullYear(now.getFullYear() - 2);
    } else if (filter === "lifetime") {
      currentStart = new Date(0);
      lastStart = new Date(0);
    } else {
      currentStart.setDate(now.getDate() - 7);
      lastStart.setDate(now.getDate() - 14);
    }

    const getMetrics = async (startDate: Date, endDate: Date) => {
      const matchCondition = { createdAt: { $gte: startDate, $lt: endDate } };
      const stats = await Grievance.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $in: ["$status", ["OPEN", "IN_PROGRESS", "ESCALATED"]] }, 1, 0] }
            },
            resolved: {
              $sum: { $cond: [{ $in: ["$status", ["RESOLVED", "CLOSED"]] }, 1, 0] }
            },
            escalated: {
              $sum: { $cond: [{ $eq: ["$status", "ESCALATED"] }, 1, 0] }
            },
            slaCompliant: {
              $sum: { $cond: [{ $in: ["$escalationLevel", [0, null]] }, 1, 0] }
            },
            ratingSum: {
              $sum: { $cond: [{ $ifNull: ["$rating", false] }, "$rating", 0] }
            },
            ratingCount: {
              $sum: { $cond: [{ $ifNull: ["$rating", false] }, 1, 0] }
            }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0, active: 0, resolved: 0, escalated: 0,
        slaCompliant: 0, ratingSum: 0, ratingCount: 0
      };

      return {
        totalComplaints: result.total,
        active: result.active,
        resolved: result.resolved,
        escalated: result.escalated,
        slaCompliance: result.total > 0 ? Number(((result.slaCompliant / result.total) * 100).toFixed(1)) : 0,
        satisfaction: result.ratingCount > 0 ? Number((result.ratingSum / result.ratingCount).toFixed(1)) : 0
      };
    };

    const currentPeriod = await getMetrics(currentStart, now);
    let previousPeriod = null;
    if (filter !== "lifetime") {
      previousPeriod = await getMetrics(lastStart, currentStart);
    }

    // Charts data only for current period
    const formatStr = filter === "year" || filter === "lifetime" ? "%Y-%m" : "%Y-%m-%d";

    const trendRaised = await Grievance.aggregate([
      { $match: { createdAt: { $gte: currentStart, $lt: now } } },
      {
        $group: {
          _id: { $dateToString: { format: formatStr, date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const trendResolved = await Grievance.aggregate([
      { $match: { updatedAt: { $gte: currentStart, $lt: now }, status: { $in: ["RESOLVED", "CLOSED"] } } },
      {
        $group: {
          _id: { $dateToString: { format: formatStr, date: "$updatedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const bySubservice = await Grievance.aggregate([
      { $match: { createdAt: { $gte: currentStart, $lt: now } } },
      {
        $group: {
          _id: "$classification.subService",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "subservices",
          localField: "_id",
          foreignField: "_id",
          as: "subServiceDetails"
        }
      },
      { $unwind: { path: "$subServiceDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: "$subServiceDetails.title",
          titleHindi: "$subServiceDetails.titleHindi",
          count: 1
        }
      }
    ]);

    const byDistrict = await Grievance.aggregate([
      { $match: { createdAt: { $gte: currentStart, $lt: now } } },
      {
        $group: {
          _id: { $ifNull: ["$address.district", "Unknown"] },
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $in: ["$status", ["RESOLVED", "CLOSED"]] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ["$status", "ESCALATED"] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: "demographies",
          localField: "_id",
          foreignField: "_id",
          as: "districtDetails"
        }
      },
      { $unwind: { path: "$districtDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$districtDetails.name", "$_id"] },
          total: 1,
          resolved: 1,
          pending: 1,
          inProgress: 1,
          escalated: 1
        }
      }
    ]);

    const bySource = await Grievance.aggregate([
      { $match: { createdAt: { $gte: currentStart, $lt: now } } },
      {
        $group: {
          _id: { $ifNull: ["$channel", "Unknown"] },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "complaintsources",
          localField: "_id",
          foreignField: "_id",
          as: "channelDetails"
        }
      },
      { $unwind: { path: "$channelDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$channelDetails.title", "$_id"] },
          count: 1
        }
      }
    ]);

    return new ApiResponse({
      res,
      status: 200,
      data: {
        metrics: {
          currentPeriod,
          previousPeriod
        },
        charts: {
          trend: {
            raised: trendRaised,
            resolved: trendResolved
          },
          bySubservice,
          byDistrict,
          bySource
        }
      },
      message: "Admin dashboard analytics fetched successfully"
    });
  });

  /**
   * Get all grievances (for agents/admins) with search across ID, mobile, and subService name
   */
  static getAllGrievances = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = (req.query.status as string) || null;
    const feedback = req.query.feedback as string;

    const query: any = {};
    if (status) {
      query.status = {
        $in: status.split(",")
      };
    }

    if (feedback === 'true') {
      if (!query.status) query.status = { $in: ['RESOLVED', 'CLOSED'] };
      query.rating = { $ne: null };
    } else if (feedback === 'false') {
      if (!query.status) query.status = { $in: ['RESOLVED', 'CLOSED'] };
      query.rating = null;
    }

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
      .select("grievanceId classification.subService address status assignedPriority createdAt citizenInfo")
      .populate({
        path: "classification.subService",
        select: "title titleHindi sla service",
        populate: {
          path: "service",
          select: "title titleHindi department"
        }
      })
      .populate("address.district", "name nameHindi")
      .sort({ createdAt: -1 })
      .skip(pagination.offset)
      .limit(pagination.limit);

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
   * Get dashboard analytics for an officer
   */
  static getOfficerDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const officerId = (req as any).user.id || (req as any).user._id;
    const { filter = "week" } = req.query;

    let currentStart = new Date();
    let lastStart = new Date();
    const now = new Date();

    if (filter === "week") {
      currentStart.setDate(now.getDate() - 7);
      lastStart.setDate(now.getDate() - 14);
    } else if (filter === "month") {
      currentStart.setMonth(now.getMonth() - 1);
      lastStart.setMonth(now.getMonth() - 2);
    } else if (filter === "year") {
      currentStart.setFullYear(now.getFullYear() - 1);
      lastStart.setFullYear(now.getFullYear() - 2);
    } else {
      currentStart.setDate(now.getDate() - 7);
      lastStart.setDate(now.getDate() - 14);
    }

    const getMetrics = async (startDate: Date, endDate: Date) => {
      const assignedCount = await Grievance.countDocuments({
        assignedOfficer: officerId,
        createdAt: { $gte: startDate, $lt: endDate }
      });

      const pendingCount = await Grievance.countDocuments({
        assignedOfficer: officerId,
        status: { $nin: ["RESOLVED", "CLOSED"] },
        createdAt: { $gte: startDate, $lt: endDate }
      });

      const resolvedCount = await Grievance.countDocuments({
        assignedOfficer: officerId,
        status: { $in: ["RESOLVED"] },
        updatedAt: { $gte: startDate, $lt: endDate }
      });

      const breachedCount = await GrievanceAnalyticLog.countDocuments({
        action: "ESCALATED",
        "metadata.breachedOfficer": officerId,
        createdAt: { $gte: startDate, $lt: endDate }
      });

      return { assignedCount, pendingCount, resolvedCount, breachedCount };
    };

    const currentMetrics = await getMetrics(currentStart, now);
    const lastMetrics = await getMetrics(lastStart, currentStart);

    return new ApiResponse({
      res,
      status: 200,
      data: {
        currentPeriod: {
          totalAssigned: currentMetrics.assignedCount,
          pending: currentMetrics.pendingCount,
          resolved: currentMetrics.resolvedCount,
          slaBreached: currentMetrics.breachedCount
        },
        previousPeriod: {
          totalAssigned: lastMetrics.assignedCount,
          pending: lastMetrics.pendingCount,
          resolved: lastMetrics.resolvedCount,
          slaBreached: lastMetrics.breachedCount
        }
      },
      message: "Officer dashboard analytics fetched successfully"
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
    const status = (req.query.status as string) || null;
    const feedback = req.query.feedback as string;

    const query: any = {
      assignedOfficer: officerId 
    };

    if (status) {
      query.status = {
        $in: status.split(",")
      };
    }

    if (feedback === 'true') {
      if (!query.status) query.status = { $in: ['RESOLVED', 'CLOSED'] };
      query.rating = { $ne: null };
    } else if (feedback === 'false') {
      if (!query.status) query.status = { $in: ['RESOLVED', 'CLOSED'] };
      query.rating = null;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      let searchSubServiceIds: any[] = [];
      
      try {
        const matchingSubServices = await SubService.find({ name: searchRegex }).select("_id");
        searchSubServiceIds = matchingSubServices.map(s => s._id);
      } catch (e) {}

      query.$or = [
        { grievanceId: searchRegex },
        { "citizenInfo.mobile": searchRegex },
      ];

      if (searchSubServiceIds.length > 0) {
        query.$or.push({ "classification.subService": { $in: searchSubServiceIds } });
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
      .populate("address.district", "name nameHindi")
      .sort({ createdAt: -1 })
      .skip(pagination.offset)
      .limit(pagination.limit);

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
    const validation = submitFeedbackSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }
    const { rating, feedbackText } = validation.data;
    const citizen = req.citizen;

    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized." });
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

    await TimelineService.logEvent({
      grievanceId: grievance._id as any,
      type: "CITIZEN_FEEDBACK",
      actor: {
        id: citizen._id as any,
        name: "CITIZEN",
        role: "CITIZEN"
      },
      metadata: {
        description: timelineTemplates.CITIZEN_FEEDBACK(rating, feedbackText || "")
      }
    });

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: "Feedback submitted successfully. Thank you!",
    });
  });

  /**
   * Reopen a grievance (Citizen)
   */
  static reopenGrievance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validation = reopenGrievanceSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }
    const { reOpenReason } = validation.data;
    const citizen = req.citizen;

    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized." });
    }

    const grievance = await Grievance.findById(id);

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    // Verify ownership
    const isOwner = grievance.citizen?.toString() === citizen._id.toString();
    const isMobileMatch = grievance.citizenInfo?.mobile === citizen.mobile;

    if (!isOwner && !isMobileMatch) {
      throw new ApiError({ status: 403, message: "Forbidden. You are not authorized to reopen this grievance." });
    }

    // Enforce status constraint
    if (grievance.status !== "RESOLVED" && grievance.status !== "CLOSED") {
      throw new ApiError({ status: 400, message: "Only RESOLVED or CLOSED grievances can be reopened." });
    }

    // Enforce 7-day constraint based on updatedAt (when status was likely resolved/closed)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (new Date(grievance.updatedAt) < sevenDaysAgo) {
      throw new ApiError({ status: 400, message: "Grievance can only be reopened within 7 days of being resolved or closed." });
    }

    const oldStatus = grievance.status;

    grievance.status = "REOPENED";
    grievance.reOpenReason = reOpenReason;
    await grievance.save();

    // Log to timeline
    await TimelineService.logEvent({
      grievanceId: grievance._id as any,
      type: "STATUS_CHANGE" as any,
      actor: {
        id: citizen._id as any,
        name: "CITIZEN",
        role: "CITIZEN"
      },
      metadata: {
        description: timelineTemplates.STATUS_CHANGE(oldStatus, "REOPENED") + ` Reason: ${reOpenReason}`
      }
    });

    return new ApiResponse({
      res,
      status: 200,
      data: grievance,
      message: "Grievance reopened successfully.",
    });
  });

  /**
   * Update grievance details (by Officer)
   */
  static updateGrievanceByOfficer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const oldGrievance = await Grievance.findById(id);
    if (!oldGrievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    if (updateData.status === 'RESOLVED') {
      const hasPhotos = (oldGrievance.geotaggedImages && oldGrievance.geotaggedImages.length > 0) || (updateData.geotaggedImages && updateData.geotaggedImages.length > 0);
      if (!hasPhotos) {
        throw new ApiError({ status: 400, message: "Cannot resolve grievance: At least one photo of the resolution is required." });
      }

      const completedVisit = await FieldVisit.findOne({ grievance: id, status: 'COMPLETED' });
      if (!completedVisit) {
        throw new ApiError({ status: 400, message: "Cannot resolve grievance: A completed field visit is required before resolution." });
      }
    }

    const oldPhotosCount = oldGrievance.geotaggedImages?.length || 0;
    
    const grievance = await Grievance.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    const newPhotosCount = grievance.geotaggedImages?.length || 0;
    if (newPhotosCount > oldPhotosCount && req.user) {
      const addedPhotos = newPhotosCount - oldPhotosCount;
      const lastPhoto = grievance.geotaggedImages?.[grievance.geotaggedImages.length - 1];
      const lat = lastPhoto?.coordinates?.latitude || "N/A";
      const lng = lastPhoto?.coordinates?.longitude || "N/A";
      
      await TimelineService.logEvent({
        grievanceId: grievance._id as any,
        type: "RESOLUTION_PHOTO",
        actor: {
          id: req.user.id as any,
          name: "OFFICER", // Would normally lookup user
          role: "OFFICER"
        },
        metadata: {
          description: timelineTemplates.RESOLUTION_PHOTO(addedPhotos, lat, lng)
        }
      });
    }

    if (oldGrievance.status !== grievance.status && req.user) {
      await TimelineService.logEvent({
        grievanceId: grievance._id as any,
        type: "STATUS_CHANGE" as any, // assuming type might need adding or it accepts string
        actor: {
          id: req.user.id as any,
          name: "OFFICER",
          role: "OFFICER"
        },
        metadata: {
          description: timelineTemplates.STATUS_CHANGE(oldGrievance.status || "UNKNOWN", grievance.status || "UNKNOWN")
        }
      });
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

    const oldGrievance = await Grievance.findById(id);
    if (!oldGrievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }
    const previousOfficer = oldGrievance.assignedOfficer;

    const grievance = await Grievance.findByIdAndUpdate(
      id,
      { assignedOfficer },
      { new: true, runValidators: true }
    );

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    if (req.user) {
      await GrievanceAnalyticLog.create({
        grievance: grievance._id,
        action: "ASSIGNED",
        actionBy: (req as any).user.id || (req as any).user._id,
        assignedTo: assignedOfficer,
        metadata: {
          previousOfficer
        }
      });
    }

    const newOfficer = await User.findById(assignedOfficer).populate("role");
    let description = "Grievance transferred.";
    if (newOfficer) {
      const roleName = (newOfficer.role as any)?.designationEnglish || "Officer";
      description = timelineTemplates.ASSIGNED(roleName, newOfficer.name);
    }

    await TimelineService.logEvent({
      grievanceId: grievance._id as any,
      type: "TRANSFERRED",
      actor: {
        name: (req as any).user?.name || "System",
        role: (req as any).user?.role?.designationEnglish || "System",
      },
      metadata: {
        description
      }
    });

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
    const { status, remarks } = req.body;

    if (!status) {
      throw new ApiError({ status: 400, message: "Status is required." });
    }

    const oldGrievance = await Grievance.findById(id);
    if (!oldGrievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    if (status === "RESOLVED") {
      const hasPhotos = oldGrievance.geotaggedImages && oldGrievance.geotaggedImages.length > 0;
      if (!hasPhotos) {
        throw new ApiError({ status: 400, message: "Cannot resolve grievance: At least one photo of the resolution is required." });
      }

      const completedVisit = await FieldVisit.findOne({ grievance: id, status: 'COMPLETED' });
      if (!completedVisit) {
        throw new ApiError({ status: 400, message: "Cannot resolve grievance: A completed field visit is required before resolution." });
      }
    }

    const grievance = await Grievance.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    if (req.user) {
      if (status === "RESOLVED") {
        await TimelineService.logEvent({
          grievanceId: grievance._id as any,
          type: "RESOLVED",
          actor: { id: (req as any).user.id as any, name: req.user.name, role: req.user.role?.level || "OFFICER" },
          metadata: { description: timelineTemplates.RESOLVED(remarks || "Grievance resolved.") }
        });
      } else if (status === "CLOSED") {
        // Find how many hours it took from creation to closed (approx)
        const hours = Math.round((Date.now() - new Date(grievance.createdAt).getTime()) / (1000 * 60 * 60));
        await TimelineService.logEvent({
          grievanceId: grievance._id as any,
          type: "COMPLAINT_CLOSED",
          actor: { id: (req as any).user.id as any, name: req.user.name, role: req.user.role?.level || "OFFICER" },
          metadata: { description: timelineTemplates.COMPLAINT_CLOSED(hours) }
        });
      } else if (oldGrievance.status !== status) {
        await TimelineService.logEvent({
          grievanceId: grievance._id as any,
          type: "STATUS_CHANGE" as any,
          actor: { id: (req as any).user.id as any, name: req.user.name, role: req.user.role?.level || "OFFICER" },
          metadata: { description: timelineTemplates.STATUS_CHANGE(oldGrievance.status || "UNKNOWN", status) }
        });
      }
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

    const files = req.files as Express.Multer.File[];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Only process images
      if (!file.mimetype.startsWith("image/")) {
        throw new ApiError({ status: 400, message: `File ${file.originalname} is not a valid image.` });
      }

      // Extract GPS data using exifr
      let gpsData;
      try {
        gpsData = await exifr.gps(file.buffer);
      } catch (e) {
        console.error("Error reading geotags from image", e)
        if (isGeotagMandatory) {
          throw new ApiError({ status: 400, message: `Geotagging is mandatory for this service failed to read coordinates.` });
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
      const key = `grievances/${folderId}/geotag-${Date.now()}-${i}-${Math.floor(Math.random() * 10000)}.${ext}`;
      
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
    }).populate({
      path: "assignedOfficer",
      select: "name role",
      populate: {
        path: "role"
      }
    }).populate("address.district", "name nameHindi");

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
    }).populate({
      path: "assignedOfficer",
      select: "name role",
      populate: {
        path: "role"
      }
    }).populate("address.district", "name nameHindi");

    if (!grievance) {
      throw new ApiError({ status: 404, message: "Grievance not found." });
    }

    

    const assignedOfficerId = grievance.assignedOfficer?._id.toString();

    // Verify ownership: either explicitly assigned OR subService falls under their tags
    const isOwner = 
      (assignedOfficerId === officerId.toString())
// console.log(assignedOfficerId,officerId)
    if (!isOwner) {
      throw new ApiError({ status: 403, message: "Access denied. This grievance is not assigned to you." });
    }

    const timeline = await TimelineService.getTimelineHistory(id);
    const fieldVisits = await FieldVisit.find({ grievance: id }).sort({ createdAt: -1 });

    const responseData = {
      ...grievance.toJSON(),
      timeline,
      fieldVisits,
    };

    return new ApiResponse({
      res,
      status: 200,
      data: responseData,
      message: "Grievance details retrieved successfully",
    });
  });

}
