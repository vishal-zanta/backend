import { Request, Response } from "express";
import { Grievance, IAttachment } from "./grievance.model.js";
import { StorageService } from "../../libs/storage.lib.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../middlewares/errorHandler.js";
import { getNextSequenceValue } from "../../utils/counter.model.js";
import { State } from "country-state-city";
import { buildPagination } from "../../utils/helpers.js";

// Helper to determine the Attachment schema 'type' from mimetype
const getAttachmentType = (mimetype: string): "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" => {
  if (mimetype.startsWith("image/")) return "IMAGE";
  if (mimetype.startsWith("video/")) return "VIDEO";
  if (mimetype.startsWith("audio/")) return "AUDIO";
  return "DOCUMENT";
};

// Helper to get official state code from state name using the package
const getStateCode = (stateName?: string): string => {
  if (!stateName) return "BR"; // Default to Bihar (BR) if missing
  
  const upperInput = stateName.toUpperCase().trim();
  
  if (upperInput === "BIHAR") return "BR";

  // Search through all official Indian states
  const indianStates = State.getStatesOfCountry("IN");
  const match = indianStates.find(s => s.name.toUpperCase() === upperInput);
  
  return match ? match.isoCode : upperInput.substring(0, 2);
};

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

    // Handle File Uploads
    const attachments: IAttachment[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const ext = file.originalname.split('.').pop() || "bin";
        // Create a unique S3-like key: "grievances/CitizenId/Timestamp-Random.ext"
        const key = `grievances/${citizen._id}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
        
        const url = await StorageService.uploadFile(key, file.buffer, file.mimetype);
        
        attachments.push({
          type: getAttachmentType(file.mimetype),
          fileName: file.originalname,
          url,
          uploadedAt: new Date(),
        });
      }
    }

    // Add attachments to evidence
    if (attachments.length > 0) {
      evidence.attachments = attachments;
    }

    // Generate the Unique Grievance ID (StateCode-Year-Sequence)
    const stateName = address?.state;
    const stateCode = getStateCode(stateName);
    const year = new Date().getFullYear();
    const seq = await getNextSequenceValue(`grievance_${year}`);
    const seqString = String(seq).padStart(6, "0");
    const grievanceId = `${stateCode}-${year}-${seqString}`;

    // Merge citizenInfo (body + profile)
    const finalCitizenInfo = {
      ...(citizenInfo || {}),
      mobile: citizen.mobile, // Mandatory from profile
    };
    // If not provided in body, fallback to profile info if available
    if (citizen.fullName && !finalCitizenInfo.fullName) finalCitizenInfo.fullName = citizen.fullName;
    if (citizen.email && !finalCitizenInfo.email) finalCitizenInfo.email = citizen.email;
    if (citizen.preferredLanguage && !finalCitizenInfo.preferredLanguage) finalCitizenInfo.preferredLanguage = citizen.preferredLanguage;

    const newGrievance = await Grievance.create({
      citizen: citizen._id,
      citizenInfo: finalCitizenInfo,
      classification,
      evidence,
      impact,
      communication,
      grievanceId,
      address,
      status: "OPEN",
    });

    return new ApiResponse({
      res,
      status: 201,
      data: newGrievance,
      message: "Grievance submitted successfully",
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

    // Populate all referenced fields (Options, SubServices, etc.)
    const grievances = await Grievance.find(query)
      .populate("classification.subService")
      .populate("classification.nature")
      .populate("evidence.frequency")
      .populate("impact.affectedBeneficiary")
      .populate("impact.publicImpact")
      .populate("communication.preferredMode")
      .populate("channel")
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

}
