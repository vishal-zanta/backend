import { Grievance } from "../modules/grievance/grievance.model.js";
import { SlaConfig } from "../modules/slaConfig/slaConfig.model.js";
import { WorkflowLevel } from "../modules/workflowLevel/workflowLevel.model.js";
import { User } from "../modules/users/user.model.js";
import { TimelineService } from "../modules/timeline/timeline.service.js";
import { timelineTemplates } from "../modules/timeline/timeline.template.js";
import { Role } from "../modules/roles/role.model.js";
import { GrievanceAnalyticLog } from "../modules/grievance/grievanceAnalyticLog.model.js";

export const checkAndEscalateGrievances = async () => {
  try {
    // 1. Fetch complaints that are NOT closed or resolved
    const activeGrievances = await Grievance.find({
      status: { $nin: ["CLOSED", "RESOLVED"] },
    });

    if (!activeGrievances.length) return;

    // Load workflow levels sorted by order
    const workflowLevels = await WorkflowLevel.find({ active: true }).sort({ order: 1 });
    if (!workflowLevels.length) return;

    // Fetch all SLA configs 
    const allSlaConfigs = await SlaConfig.find({ active: true });
    const slaConfigMap = new Map();
    for (const config of allSlaConfigs) {
      slaConfigMap.set(config.subService.toString(), config);
    }

    for (const grievance of activeGrievances) {
      const subServiceId = grievance.classification?.subService?.toString();
      if (!subServiceId) continue;

      const slaConfig = slaConfigMap.get(subServiceId);
      if (!slaConfig || !slaConfig.escalations || slaConfig.escalations.length === 0) continue;

      const currentLevelIndex = grievance.escalationLevel || 0;
      
      // If already at or beyond max level, we can't escalate further
      if (currentLevelIndex >= workflowLevels.length - 1) continue;

      const currentWorkflowLevel = workflowLevels[currentLevelIndex];

      // Find the SLA hours for the CURRENT role
      const currentRoleSla = slaConfig.escalations.find(
        (esc: any) => esc.role.toString() === currentWorkflowLevel.role.toString()
      );

      if (!currentRoleSla) continue;

      // Calculate cumulative SLA up to the current level because "time per officer" is additive
      // from the createdAt timestamp.
      let cumulativeSlaHours = 0;
      for (let i = 0; i <= currentLevelIndex; i++) {
        const stepRole = workflowLevels[i].role.toString();
        const stepSla = slaConfig.escalations.find((e: any) => e.role.toString() === stepRole);
        if (stepSla) cumulativeSlaHours += stepSla.slaHours;
      }
      
      const slaMs = cumulativeSlaHours * 60 * 60 * 1000;
      const timePassedMs = Date.now() - grievance.createdAt.getTime();

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

        // Limit users to 10 to keep the query extremely fast and memory-efficient
        const availableOfficers = await User.find({ 
          role: nextRoleId, 
          status: 'ACTIVE' 
        })
        .sort({ escalatedCount: 1 })
        .limit(10);

        if (availableOfficers.length > 0) {
          const nextOfficer = availableOfficers[0];

          // Reassign and jump to the correct next level
          grievance.assignedOfficer = nextOfficer._id as any;
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
// TODO:need some changes and observations
export const initCronJobs = () => {
  console.log("[Cron] Initializing background jobs...");
  // Run every 1 minute (60,000 ms)
  setInterval(async () => {
    await checkAndEscalateGrievances();
  }, 60 * 1000);
};
