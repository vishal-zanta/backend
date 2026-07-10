import { Grievance, IAttachment } from "./grievance.model.js";
import { StorageService } from "../../libs/storage.lib.js";
import { getNextSequenceValue } from "../../utils/counter.model.js";
import { State } from "country-state-city";
import { ObjectId } from "mongoose";

// Helper to determine the Attachment schema 'type' from mimetype
const getAttachmentType = (mimetype: string): "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" => {
  if (mimetype.startsWith("image/")) return "IMAGE";
  if (mimetype.startsWith("video/")) return "VIDEO";
  if (mimetype.startsWith("audio/")) return "AUDIO";
  return "DOCUMENT";
};

// Helper to get official state code from state name
const getStateCode = (stateName?: string): string => {
  if (!stateName) return "BR"; 
  const upperInput = stateName.toUpperCase().trim();
  if (upperInput === "BIHAR") return "BR";
  const indianStates = State.getStatesOfCountry("IN");
  const match = indianStates.find(s => s.name.toUpperCase() === upperInput);
  return match ? match.isoCode : upperInput.substring(0, 2);
};

export class GrievanceService {
  /**
   * Core logic for creating a Grievance with files.
   */
  static async createGrievance(payload: {
    citizen?: any;
    classification: any;
    evidence: any;
    impact: any;
    communication: any;
    address: any;
    citizenInfo: any;
    files?: Express.Multer.File[];
    createdBy?: ObjectId;
  }) {
    const { citizen, classification, evidence, impact, communication, address, citizenInfo, files, createdBy } = payload;

    // Handle File Uploads
    const attachments: IAttachment[] = [];
    if (files && Array.isArray(files)) {
      for (const file of files) {
        const ext = file.originalname.split('.').pop() || "bin";
        // Create a unique S3-like key
        const folderId = citizen?._id ? citizen._id.toString() : "agent-created";
        const key = `grievances/${folderId}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
        
        const url = await StorageService.uploadFile(key, file.buffer, file.mimetype);
        
        attachments.push({
          type: getAttachmentType(file.mimetype),
          fileName: file.originalname,
          url,
          uploadedAt: new Date(),
        });
      }
    }

    if (attachments.length > 0) {
      evidence.attachments = attachments;
    }

    const stateName = address?.state;
    const stateCode = getStateCode(stateName);
    const year = new Date().getFullYear();
    const seq = await getNextSequenceValue(`grievance_${year}`);
    const seqString = String(seq).padStart(6, "0");
    const grievanceId = `${stateCode}-${year}-${seqString}`;

    // Merge citizenInfo (body + profile)
    const finalCitizenInfo = {
      ...(citizenInfo || {}),
      mobile: citizen?.mobile || citizenInfo?.mobile, // Mandatory from profile or body
    };
    
    if (!finalCitizenInfo.mobile) {
      throw new Error("Mobile number is required in citizenInfo when creating on behalf of a citizen.");
    }
    
    if (citizen?.fullName && !finalCitizenInfo.fullName) finalCitizenInfo.fullName = citizen.fullName;
    if (citizen?.email && !finalCitizenInfo.email) finalCitizenInfo.email = citizen.email;
    if (citizen?.preferredLanguage && !finalCitizenInfo.preferredLanguage) finalCitizenInfo.preferredLanguage = citizen.preferredLanguage;

    const payloadToCreate: any = {
      citizenInfo: finalCitizenInfo,
      classification,
      evidence,
      impact,
      communication,
      grievanceId,
      address,
      status: "OPEN",
      createdBy
    };
    
    if (citizen && citizen._id) {
      payloadToCreate.citizen = citizen._id;
    }

    const newGrievance = await Grievance.create(payloadToCreate);

    return newGrievance;
  }
}
