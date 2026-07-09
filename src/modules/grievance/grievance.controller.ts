import { Request, Response } from "express";
import { Grievance, IAttachment } from "./grievance.model.js";
import { StorageService } from "../../libs/storage.lib.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../middlewares/errorHandler.js";
import { getNextSequenceValue } from "../../utils/counter.model.js";
import { State } from "country-state-city";

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
    let classification, evidence, impact, communication, address;
    console.log("Received form-data:", req.body);
    try {
      classification = typeof req.body.classification === "string" ? JSON.parse(req.body.classification) : req.body.classification;
      evidence = typeof req.body.evidence === "string" ? JSON.parse(req.body.evidence) : req.body.evidence;
      impact = typeof req.body.impact === "string" ? JSON.parse(req.body.impact) : req.body.impact;
      communication = typeof req.body.communication === "string" ? JSON.parse(req.body.communication) : req.body.communication;
      address = typeof req.body.address === "string" ? JSON.parse(req.body.address) : req.body.address;
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

    const newGrievance = await Grievance.create({
      citizen: citizen._id,
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
}
