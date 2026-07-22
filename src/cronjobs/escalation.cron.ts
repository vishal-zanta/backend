import { Grievance } from "../modules/grievance/grievance.model.js";
import { SlaConfig } from "../modules/slaConfig/slaConfig.model.js";
import { WorkflowLevel } from "../modules/workflowLevel/workflowLevel.model.js";
import { User } from "../modules/users/user.model.js";
import { TimelineService } from "../modules/timeline/timeline.service.js";
import { timelineTemplates } from "../modules/timeline/timeline.template.js";
import { Role } from "../modules/roles/role.model.js";
import { GrievanceAnalyticLog } from "../modules/grievance/grievanceAnalyticLog.model.js";
import { OfficerTagging } from "../modules/officerTagging/officerTagging.model.js";

export const checkAndEscalateGrievances = async () => {
  try {
    // 1. Fetch complaints that are NOT closed or resolved
    const activeGrievances = await Grievance.find({
      status: { $nin: ["CLOSED", "RESOLVED"] },
    })
      .populate("assignedOfficer")
      .populate({
        path: "classification.subService",
        populate: { path: "service" }
      });

    if (!activeGrievances.length) return;

    // Load workflows and map by department
    const workflows = await WorkflowLevel.find({ active: true });
    const workflowMap = new Map();
    for (const wf of workflows) {
      workflowMap.set(wf.department.toString(), wf.levels.sort((a, b) => a.order - b.order));
    }

    if (!workflows.length) return;

    // Fetch all SLA configs 
    const allSlaConfigs = await SlaConfig.find({ active: true });
    // console.log(allSlaConfigs, "allSlaConfigs")
    const slaConfigMap = new Map();
    for (const config of allSlaConfigs) {
      slaConfigMap.set(config.subService.toString(), config);
    }

    for (const grievance of activeGrievances) {
      console.log("complain",grievance.grievanceId)
      const subServiceId = grievance.classification?.subService?._id?.toString();
      const departmentId = (grievance.classification?.subService as any)?.service?.department?.toString();
      
      console.log(subServiceId,"subServiceId")
      if (!subServiceId || !departmentId) continue;

      const slaConfig = slaConfigMap.get(subServiceId);
      console.log(slaConfig,"slaConfig")

      if (!slaConfig || !slaConfig.escalations || slaConfig.escalations.length === 0) continue;

      const workflowLevels = workflowMap.get(departmentId);
      if (!workflowLevels || !workflowLevels.length) continue;

      let currentLevelIndex = grievance.escalationLevel || 0;
      const assignedUser = grievance.assignedOfficer as any;
      if (assignedUser && assignedUser.role) {
        const roleIdStr = assignedUser.role.toString();
        const foundIndex = workflowLevels.findIndex((wl: any) => wl.role.toString() === roleIdStr);
        if (foundIndex !== -1) {
          currentLevelIndex = foundIndex;
        }
      }
      console.log(currentLevelIndex,workflowLevels.length - 1,"currentLevelIndex")
      // If already at or beyond max level, we can't escalate further
      if (currentLevelIndex >= workflowLevels.length - 1) continue;

      const currentWorkflowLevel = workflowLevels[currentLevelIndex];
console.log(currentWorkflowLevel,"currentWorkflowLevel")
      // Find the SLA hours for the CURRENT role
      const currentRoleSla = slaConfig.escalations.find(
        (esc: any) => esc.role.toString() === currentWorkflowLevel.role.toString()
      );
console.log(currentRoleSla,"currentRoleSla")
      if (!currentRoleSla) continue;

      // Calculate cumulative SLA up to the current level because "time per officer" is additive
      // from the createdAt timestamp.
      let cumulativeSlaHours = 0;
      for (let i = 0; i <= currentLevelIndex; i++) {
        const stepRole = workflowLevels[i].role.toString();
        const stepSla = slaConfig.escalations.find((e: any) => e.role.toString() === stepRole);
        if (stepSla) cumulativeSlaHours += stepSla.slaHours;
      }
      console.log(cumulativeSlaHours, "cumulativeSlaHours")
      
      const slaMs = cumulativeSlaHours * 60 * 60 * 1000;
      const timePassedMs = Date.now() - grievance.createdAt.getTime();

      console.log(`timePassedMs: ${timePassedMs}ms (${Math.round(timePassedMs/1000/60)} mins), slaMs: ${slaMs}ms (${cumulativeSlaHours} hours)`);

      if (timePassedMs > slaMs) {
        // SLA Breached! Find the NEXT valid role in the workflow that is ALSO in the SlaConfig (OPTIMIZATION 3)
        let nextValidLevelIndex = -1;
        let nextWorkflowLevel = null;

        for (let i = currentLevelIndex + 1; i < workflowLevels.length; i++) {
          const checkRole = workflowLevels[i].role.toString();
          
          // Check if this workflow role actually exists in the SLA config for this subservice
          const roleInSla = slaConfig.escalations.some((esc: any) => esc.role.toString() === checkRole);
          
          if (roleInSla) {
            nextValidLevelIndex = i;
            nextWorkflowLevel = workflowLevels[i];
            break;
          }
        }

        // If no further valid escalation level was found in the config, we stop escalating
        if (nextValidLevelIndex === -1 || !nextWorkflowLevel) continue;

        const nextRoleId = nextWorkflowLevel.role;
        const nextLevelName = await Role.findById(nextRoleId);

        const eligibleUsers = await User.find({ role: nextRoleId, status: 'ACTIVE' }).select('_id');
        const userIds = eligibleUsers.map(u => u._id);

        if (userIds.length === 0) continue;

        const tagQuery: any = {
          officer: { $in: userIds },
          services: subServiceId,
          active: true
        };
        
        const ward = grievance.address?.villageOrWard;
        if (ward) {
          tagQuery.wards = ward;
        }
        
        const eligibleTags = await OfficerTagging.find(tagQuery).select('officer');
        
        let availableOfficers = [];
        if (eligibleTags.length > 0) {
          const taggedUserIds = eligibleTags.map((t: any) => t.officer);
          availableOfficers = await User.find({ _id: { $in: taggedUserIds }, status: 'ACTIVE' })
            .sort({ escalatedCount: 1 })
            .limit(10);
        } else {
          // Fallback if no tagging found for this level (e.g. state level officers might not be tagged by ward)
          availableOfficers = await User.find({ _id: { $in: userIds }, status: 'ACTIVE' })
            .sort({ escalatedCount: 1 })
            .limit(10);
        }

        if (availableOfficers.length > 0) {
          const nextOfficer = availableOfficers[0];

          // Reassign and jump to the correct next level
          grievance.assignedOfficer = nextOfficer._id as any;
          grievance.assignedAt = new Date() as any;
          grievance.escalationLevel = nextValidLevelIndex;
          grievance.status = "OPEN"; 
          
          await grievance.save();

          // Increment the officer's escalatedCount
          nextOfficer.escalatedCount = (nextOfficer.escalatedCount || 0) + 1;
          await nextOfficer.save();

          // Log to timeline
          await TimelineService.logEvent({
            grievanceId: grievance._id as any,
            type: "ESCALATED",
            actor: {
              // id: nextOfficer._id as any,
              name: "System Auto-Escalation",
              role: "System",
            },
            metadata: {
              description:timelineTemplates.ESCALATED(currentRoleSla.slaHours,nextLevelName?.level!,"system")
            }
          });

          // Log to analytic tracker (two separate logs: one for breach, one for assignment)
          await GrievanceAnalyticLog.insertMany([
            {
              grievance: grievance._id,
              action: "ESCALATED",
              metadata: {
                breachedOfficer: grievance.assignedOfficer,
                timeTakenBeforeEscalationMs: timePassedMs,
                timeTakenBeforeEscalationHours: Math.round(timePassedMs / (1000 * 60 * 60)),
                slaHoursAllowed: cumulativeSlaHours
              }
            },
            {
              grievance: grievance._id,
              action: "ASSIGNED",
              assignedTo: nextOfficer._id,
              metadata: {
                previousOfficer: grievance.assignedOfficer,
                assignedBy: "SYSTEM_CRON"
              }
            }
          ]);
          
          console.log(`[Cron] Grievance ${grievance.grievanceId} escalated to ${nextOfficer.name} (Level ${grievance.escalationLevel})`);
        }
      }
    }
  } catch (error) {
    console.error("[Cron Error] checkAndEscalateGrievances:", error);
  }
};
export const initCronJobs = () => {
  console.log("[Cron] Initializing background jobs...");
  // Run every 1 minute (60,000 ms)
  setInterval(async () => {
    await checkAndEscalateGrievances();
  }, 60 * 1000);
};
