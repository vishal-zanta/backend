import { Grievance, IAttachment } from "./grievance.model.js";
import { StorageService } from "../../libs/storage.lib.js";
import { getNextSequenceValue } from "../../utils/counter.model.js";
import { State } from "country-state-city";
import { ObjectId } from "mongoose";
import { TimelineService } from "../timeline/timeline.service.js";
import { User } from "../users/user.model.js";
import { timelineTemplates } from "../timeline/timeline.template.js";
import { SubService } from "../services/subService.model.js";
import { FieldVisit } from "../fieldVisit/fieldVisit.model.js";
import { WorkflowLevel } from "../workflowLevel/workflowLevel.model.js";
import { OfficerTagging } from "../officerTagging/officerTagging.model.js";

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
   * Determine the best officer to assign to a grievance based on workflow levels,
   * tagged sub-services, and wards (round-robin).
   */
  static async autoAssignOfficer(subServiceId: string, ward?: string): Promise<string | null> {
    try {
      const subService = await SubService.findById(subServiceId).populate('service');
      if (!subService || !(subService as any).service || !(subService as any).service.department) return null;
      const departmentId = (subService as any).service.department;

      const workflowDoc = await WorkflowLevel.findOne({ department: departmentId, active: true });
      if (!workflowDoc || !workflowDoc.levels || workflowDoc.levels.length === 0) return null;
      
      const sortedLevels = workflowDoc.levels.sort((a, b) => a.order - b.order);

      for (const level of sortedLevels) {
        const roleId = level.role;
        
        const eligibleUsers = await User.find({ role: roleId, status: 'ACTIVE' }).select('_id');
        const userIds = eligibleUsers.map(u => u._id);

        if (userIds.length === 0) continue;

        const tagQuery: any = {
          officer: { $in: userIds },
          services: subServiceId,
          active: true
        };
        
        if (ward) {
          tagQuery.wards = ward;
        }
        
        const eligibleTags = await OfficerTagging.find(tagQuery).select('officer');
        
        if (eligibleTags.length === 0) continue;

        const officerIds = [...new Set(eligibleTags.map(t => t.officer.toString()))].sort();
        
        const lastGrievanceQuery: any = {
          "classification.subService": subServiceId,
          assignedOfficer: { $in: eligibleTags.map(t => t.officer) }
        };
        if (ward) {
          lastGrievanceQuery["address.villageOrWard"] = ward;
        }
        
        const lastGrievance = await Grievance.findOne(lastGrievanceQuery)
          .sort({ createdAt: -1 })
          .select('assignedOfficer');
          
        let assignedOfficerId = officerIds[0];
        
        if (lastGrievance && lastGrievance.assignedOfficer) {
          const lastOfficerId = lastGrievance.assignedOfficer.toString();
          const lastIndex = officerIds.indexOf(lastOfficerId);
          if (lastIndex !== -1) {
            const nextIndex = (lastIndex + 1) % officerIds.length;
            assignedOfficerId = officerIds[nextIndex];
          }
        }
        
        return assignedOfficerId;
      }
      
      return null;
    } catch (assignError) {
      console.error("Auto-assign error:", assignError);
      return null;
    }
  }

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
    channel?: any;
  }) {
    const { citizen, classification, evidence, impact, communication, address, citizenInfo, files, createdBy, channel } = payload;

    // console.log("createdby ",createdBy)
    // Handle File Uploads
    const attachments: IAttachment[] = [];
    if (files && Array.isArray(files)) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.originalname.split('.').pop() || "bin";
        // Create a strictly unique key by appending the loop index
        const folderId = citizen?._id ? citizen._id.toString() : "agent-created";
        const key = `grievances/${folderId}/${Date.now()}-${i}-${Math.floor(Math.random() * 10000)}.${ext}`;
        
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
      createdBy,
      channel
    };
    
    if (citizen && citizen._id) {
      payloadToCreate.citizen = citizen._id;
    }

    // Auto Assignment Logic
    const subServiceId = classification?.subService;
    if (subServiceId) {
      const ward = address?.villageOrWard;
      const assignedOfficerId = await GrievanceService.autoAssignOfficer(subServiceId, ward);
      if (assignedOfficerId) {
        payloadToCreate.assignedOfficer = assignedOfficerId;
        payloadToCreate.assignedAt = new Date();
      }
    }

    const newGrievance = await Grievance.create(payloadToCreate);

    const officer:any = await User.findById(createdBy).populate("role").lean();

    await TimelineService.logEvent({
      grievanceId: newGrievance._id,
      type:"COMPLAINT_REGISTERED",
      actor:{
        id: createdBy || citizen?._id,
        name: officer?.name || "CITIZEN",
        role: officer?.role?.level || "CITIZEN",
      },
      metadata:{
        description:timelineTemplates.COMPLAINT_REGISTERED(newGrievance.grievanceId, officer?.role?.level || "CITIZEN")
      }
    });

    if (newGrievance.assignedOfficer) {
      const assignedUser: any = await User.findById(newGrievance.assignedOfficer).populate("role").lean();
      if (assignedUser) {
        await TimelineService.logEvent({
          grievanceId: newGrievance._id,
          type: "ASSIGNED",
          actor: {
            id: createdBy || citizen?._id,
            name: officer?.name || "SYSTEM",
            role: officer?.role?.level || "SYSTEM",
          },
          metadata: {
            description: timelineTemplates.ASSIGNED(assignedUser?.role?.level || "Officer", assignedUser.name)
          }
        });
      }
    }

    // Handle Field Visit Auto-Generation
    if (classification?.subService) {
      const subServiceDoc = await SubService.findById(classification.subService);
      if (subServiceDoc && subServiceDoc.fieldVisit) {
        const visitSeq = await getNextSequenceValue(`visit_${year}`);
        const visitSeqString = String(visitSeq).padStart(4, "0");
        const visitId = `FV-${year}-${visitSeqString}`;
        
        await FieldVisit.create({
          visitId,
          grievance: newGrievance._id,
          status: 'PENDING'
        });
      }
    }

    return newGrievance;
  }
}
