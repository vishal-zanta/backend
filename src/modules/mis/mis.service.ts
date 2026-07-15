import moment from "moment";
import { Grievance } from "../grievance/grievance.model.js";
import { User } from "../users/user.model.js";
import { Role } from "../roles/role.model.js";
import { Demography } from "../demography/demography.model.js";
import { Ulb } from "../demography/ulb.model.js";
import { ComplaintSource } from "../complaintSource/complaintSource.model.js";
import { ActivityService } from "../activity/activity.service.js";
import { ApiError } from "../../middlewares/errorHandler.js";

export const REPORT = {
  SUMMARY: "summary",
  OFFICER: "officer",
  SERVICE: "service",
  URBAN: "urban",
  ULB: "ulb",
  RURAL: "rural",
  IVR: "ivr",
  AGENT: "agent",
} as const;

export type ReportType = (typeof REPORT)[keyof typeof REPORT];

export const VALID_REPORTS: ReportType[] = Object.values(REPORT);

const REPORT_DATA_KEYS: Record<ReportType, string> = {
  [REPORT.SUMMARY]: "districtWise",
  [REPORT.OFFICER]: "officerRanking",
  [REPORT.SERVICE]: "servicePerformance",
  [REPORT.URBAN]: "ulbWise",
  [REPORT.ULB]: "ulbWise",
  [REPORT.RURAL]: "blockWise",
  [REPORT.IVR]: "ivrStats",
  [REPORT.AGENT]: "agentPerformance",
};

export interface MisQueryParams {
  report: ReportType;
  district?: string;
  dateRange?: string;
  fromDate?: string;
  toDate?: string;
}

interface DateBounds {
  from: Date;
  to: Date;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function round1(n: number): number {
  return Number(n.toFixed(1));
}

function formatDuration(ms: number): string {
  if (!ms || ms < 0 || Number.isNaN(ms)) return "0h";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remH = hours % 24;
    return remH > 0 ? `${days}d ${remH}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

export function resolveDateRange(
  dateRange: string,
  fromDate?: string,
  toDate?: string,
): DateBounds {
  const range = (dateRange || "fy").toLowerCase();
  const now = moment();

  if (range === "custom") {
    if (!fromDate || !toDate) {
      throw new ApiError({
        status: 400,
        message: "fromDate and toDate are required for custom dateRange",
      });
    }
    const from = moment(fromDate, "YYYY-MM-DD", true);
    const to = moment(toDate, "YYYY-MM-DD", true);
    if (!from.isValid() || !to.isValid()) {
      throw new ApiError({
        status: 400,
        message: "fromDate and toDate must be valid dates in YYYY-MM-DD format",
      });
    }
    if (from.isAfter(to)) {
      throw new ApiError({
        status: 400,
        message: "fromDate must be before or equal to toDate",
      });
    }
    return { from: from.startOf("day").toDate(), to: to.endOf("day").toDate() };
  }

  if (range === "cy") {
    return {
      from: now.clone().startOf("year").toDate(),
      to: now.clone().endOf("year").toDate(),
    };
  }

  // Financial Year (India): Apr 1 → Mar 31
  const fyStartYear = now.month() >= 3 ? now.year() : now.year() - 1;
  return {
    from: moment(`${fyStartYear}-04-01`, "YYYY-MM-DD").startOf("day").toDate(),
    to: moment(`${fyStartYear + 1}-03-31`, "YYYY-MM-DD").endOf("day").toDate(),
  };
}

function buildBaseMatch(district: string | undefined, bounds: DateBounds): Record<string, unknown> {
  const match: Record<string, unknown> = {
    createdAt: { $gte: bounds.from, $lte: bounds.to },
  };

  if (district && district.toLowerCase() !== "all") {
    match["address.district"] = {
      $regex: `^${escapeRegex(district.trim())}$`,
      $options: "i",
    };
  }

  return match;
}

function statusCounters() {
  return {
    total: { $sum: 1 },
    resolved: {
      $sum: { $cond: [{ $in: ["$status", ["RESOLVED", "CLOSED"]] }, 1, 0] },
    },
    pending: {
      $sum: { $cond: [{ $in: ["$status", ["OPEN", "REOPENED"]] }, 1, 0] },
    },
    inProgress: {
      $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] },
    },
    escalated: {
      $sum: { $cond: [{ $eq: ["$status", "ESCALATED"] }, 1, 0] },
    },
    slaCompliant: {
      $sum: {
        $cond: [
          {
            $or: [
              { $eq: ["$escalationLevel", 0] },
              { $eq: ["$escalationLevel", null] },
              { $not: ["$escalationLevel"] },
            ],
          },
          1,
          0,
        ],
      },
    },
  };
}

async function getSummaryReport(match: Record<string, unknown>) {
  const rows = await Grievance.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ["$address.district", "Unknown"] },
        ...statusCounters(),
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        district: "$_id",
        total: 1,
        resolved: 1,
        pending: 1,
        inProgress: 1,
        escalated: 1,
      },
    },
  ]);

  return rows;
}

async function getOfficerRankingReport(match: Record<string, unknown>) {
  const rows = await Grievance.aggregate([
    {
      $match: {
        ...match,
        assignedOfficer: { $ne: null },
        status: { $in: ["RESOLVED", "CLOSED"] },
      },
    },
    {
      $group: {
        _id: "$assignedOfficer",
        resolved: { $sum: 1 },
        slaCompliant: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$escalationLevel", 0] },
                  { $eq: ["$escalationLevel", null] },
                  { $not: ["$escalationLevel"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        ratingSum: {
          $sum: { $cond: [{ $ifNull: ["$rating", false] }, "$rating", 0] },
        },
        ratingCount: {
          $sum: { $cond: [{ $ifNull: ["$rating", false] }, 1, 0] },
        },
        totalResolutionMs: {
          $sum: { $subtract: ["$updatedAt", "$createdAt"] },
        },
      },
    },
    { $sort: { resolved: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "officer",
      },
    },
    { $unwind: { path: "$officer", preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: "roles",
        localField: "officer.role",
        foreignField: "_id",
        as: "role",
      },
    },
    { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "demographies",
        localField: "officer.district",
        foreignField: "_id",
        as: "officerDistrict",
      },
    },
    { $unwind: { path: "$officerDistrict", preserveNullAndEmptyArrays: true } },
  ]);

  return rows.map((row, index) => ({
    rank: index + 1,
    name: row.officer?.name || "Unknown",
    designation: row.role?.designationEnglish || "Officer",
    district: row.officerDistrict?.name || "N/A",
    resolved: row.resolved,
    slaCompliance:
      row.resolved > 0 ? round1((row.slaCompliant / row.resolved) * 100) : 0,
    avgResolution: formatDuration(
      row.resolved > 0 ? row.totalResolutionMs / row.resolved : 0,
    ),
    rating: row.ratingCount > 0 ? round1(row.ratingSum / row.ratingCount) : 0,
  }));
}

async function getServicePerformanceReport(match: Record<string, unknown>) {
  const rows = await Grievance.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "subservices",
        localField: "classification.subService",
        foreignField: "_id",
        as: "subService",
      },
    },
    { $unwind: { path: "$subService", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "services",
        localField: "subService.service",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        withinSlaFlag: {
          $cond: [
            {
              $or: [
                { $eq: ["$escalationLevel", 0] },
                { $eq: ["$escalationLevel", null] },
                { $not: ["$escalationLevel"] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$service.title", "Unknown"] },
        withinSLA: { $sum: "$withinSlaFlag" },
        total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        service: "$_id",
        withinSLA: 1,
        beyondSLA: { $subtract: ["$total", "$withinSLA"] },
        compliance: {
          $cond: [
            { $gt: ["$total", 0] },
            {
              $round: [
                { $multiply: [{ $divide: ["$withinSLA", "$total"] }, 100] },
                1,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { compliance: -1 } },
  ]);

  return rows;
}

async function getUlbWiseReport(match: Record<string, unknown>, bounds: DateBounds) {
  const urbanDistricts = await Demography.find({ urban: true, active: true })
    .select("name population")
    .lean();
  const urbanNames = urbanDistricts.map((d) => d.name);
  const popByDistrict = new Map(
    urbanDistricts.map((d) => [d.name.toLowerCase(), d.population || 0]),
  );

  const districtFilter =
    urbanNames.length > 0
      ? {
          $or: urbanNames.map((name) => ({
            "address.district": {
              $regex: `^${escapeRegex(name)}$`,
              $options: "i",
            },
          })),
        }
      : {};

  const ulbMatch = { ...match, ...districtFilter };

  const currentRows = await Grievance.aggregate([
    { $match: ulbMatch },
    {
      $group: {
        _id: {
          ulb: {
            $ifNull: [
              "$address.subdivision",
              { $ifNull: ["$address.villageOrWard", "Unknown"] },
            ],
          },
          district: { $ifNull: ["$address.district", "Unknown"] },
        },
        complaints: { $sum: 1 },
        slaCompliant: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$escalationLevel", 0] },
                  { $eq: ["$escalationLevel", null] },
                  { $not: ["$escalationLevel"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        ratingSum: {
          $sum: { $cond: [{ $ifNull: ["$rating", false] }, "$rating", 0] },
        },
        ratingCount: {
          $sum: { $cond: [{ $ifNull: ["$rating", false] }, 1, 0] },
        },
      },
    },
  ]);

  // Previous period of equal length for trend
  const periodMs = bounds.to.getTime() - bounds.from.getTime();
  const prevBounds: DateBounds = {
    from: new Date(bounds.from.getTime() - periodMs - 1),
    to: new Date(bounds.from.getTime() - 1),
  };

  const prevUlbMatch: Record<string, unknown> = {
    createdAt: { $gte: prevBounds.from, $lte: prevBounds.to },
    ...districtFilter,
  };
  if (match["address.district"]) {
    prevUlbMatch["address.district"] = match["address.district"];
  }

  const prevRows = await Grievance.aggregate([
    { $match: prevUlbMatch },
    {
      $group: {
        _id: {
          ulb: {
            $ifNull: [
              "$address.subdivision",
              { $ifNull: ["$address.villageOrWard", "Unknown"] },
            ],
          },
          district: { $ifNull: ["$address.district", "Unknown"] },
        },
        complaints: { $sum: 1 },
      },
    },
  ]);

  const prevMap = new Map(
    prevRows.map((r) => [
      `${String(r._id.ulb).toLowerCase()}|${String(r._id.district).toLowerCase()}`,
      r.complaints as number,
    ]),
  );

  // Enrich ULB display names from Ulb collection when possible
  const ulbs = await Ulb.find({ active: true })
    .populate<{ district: { name: string; population: number } }>("district", "name population")
    .lean();
  const ulbNameSet = new Map(ulbs.map((u) => [u.name.toLowerCase(), u]));

  const ranked = currentRows
    .map((row) => {
      const ulbKey = String(row._id.ulb);
      const districtKey = String(row._id.district);
      const registered = ulbNameSet.get(ulbKey.toLowerCase());
      const population =
        (registered?.district && typeof registered.district === "object"
          ? registered.district.population
          : undefined) ??
        popByDistrict.get(districtKey.toLowerCase()) ??
        0;
      const complaints = row.complaints as number;
      const prev =
        prevMap.get(`${ulbKey.toLowerCase()}|${districtKey.toLowerCase()}`) || 0;
      let trend: "up" | "down" | "stable" = "stable";
      if (complaints > prev) trend = "up";
      else if (complaints < prev) trend = "down";

      return {
        ulb: registered?.name || ulbKey,
        population,
        complaints,
        perCapita: population > 0 ? round1((complaints / population) * 1000) : 0,
        slaCompliance:
          complaints > 0 ? round1((row.slaCompliant / complaints) * 100) : 0,
        rating: row.ratingCount > 0 ? round1(row.ratingSum / row.ratingCount) : 0,
        trend,
      };
    })
    .sort((a, b) => b.slaCompliance - a.slaCompliance || b.complaints - a.complaints)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return ranked;
}

async function getBlockWiseReport(match: Record<string, unknown>) {
  const ruralDistricts = await Demography.find({ urban: false, active: true })
    .select("name")
    .lean();
  const ruralNames = ruralDistricts.map((d) => d.name);

  const ruralFilter =
    ruralNames.length > 0
      ? {
          $or: ruralNames.map((name) => ({
            "address.district": {
              $regex: `^${escapeRegex(name)}$`,
              $options: "i",
            },
          })),
        }
      : {};

  const ruralMatch = { ...match, ...ruralFilter };

  const rows = await Grievance.aggregate([
    { $match: ruralMatch },
    {
      $group: {
        _id: {
          block: {
            $ifNull: [
              "$address.subdivision",
              { $ifNull: ["$address.villageOrWard", "Unknown"] },
            ],
          },
          district: { $ifNull: ["$address.district", "Unknown"] },
        },
        ...statusCounters(),
      },
    },
    {
      $project: {
        _id: 0,
        block: "$_id.block",
        district: "$_id.district",
        total: 1,
        resolved: 1,
        pending: 1,
        inProgress: 1,
        escalated: 1,
        slaCompliance: {
          $cond: [
            { $gt: ["$total", 0] },
            {
              $round: [
                { $multiply: [{ $divide: ["$slaCompliant", "$total"] }, 100] },
                1,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return rows;
}

async function getIvrStatsReport(match: Record<string, unknown>) {
  // IVR is not district-scoped — keep only the date window
  const { ["address.district"]: _districtIgnored, ...dateMatch } = match as {
    "address.district"?: unknown;
    createdAt?: unknown;
  };
  const ivrSource = await ComplaintSource.findOne({
    title: { $regex: /^ivr$/i },
  }).lean();

  const agentRoles = await Role.find({
    level: { $in: ["CCE", "Supervisor"] },
  })
    .select("_id")
    .lean();
  const agentRoleIds = agentRoles.map((r) => r._id);

  // Grievances created via IVR channel or by call-centre agents
  const agentUsers = agentRoleIds.length
    ? await User.find({ role: { $in: agentRoleIds } }).select("_id isBreak status").lean()
    : [];
  const agentIds = agentUsers.map((u) => u._id);

  const orFilters: Record<string, unknown>[] = [];
  if (ivrSource) orFilters.push({ channel: ivrSource._id });
  if (agentIds.length) orFilters.push({ createdBy: { $in: agentIds } });

  // No IVR/agent mapping → zeros (no call-centre log model yet)
  const effectiveMatch =
    orFilters.length > 0
      ? { ...dateMatch, $or: orFilters }
      : { ...dateMatch, _id: null };

  const stats = await Grievance.aggregate([
    { $match: effectiveMatch },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $in: ["$status", ["RESOLVED", "CLOSED"]] }, 1, 0] },
        },
        slaCompliant: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$escalationLevel", 0] },
                  { $eq: ["$escalationLevel", null] },
                  { $not: ["$escalationLevel"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalTalkMs: {
          $sum: {
            $cond: [
              { $in: ["$status", ["RESOLVED", "CLOSED"]] },
              { $subtract: ["$updatedAt", "$createdAt"] },
              0,
            ],
          },
        },
        resolvedCount: {
          $sum: { $cond: [{ $in: ["$status", ["RESOLVED", "CLOSED"]] }, 1, 0] },
        },
      },
    },
  ]);

  const peakHourAgg = await Grievance.aggregate([
    { $match: effectiveMatch },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  const result = stats[0] || {
    totalCalls: 0,
    resolved: 0,
    slaCompliant: 0,
    totalTalkMs: 0,
    resolvedCount: 0,
  };

  const activeCce = ActivityService.getActiveUsers("CCE");
  const activeSupervisors = ActivityService.getActiveUsers("Supervisor");
  const activeAgents = activeCce.count + activeSupervisors.count;
  const totalAgents = agentUsers.length;

  // Missed calls are not tracked; approximate as non-resolved tickets in period
  const callsMissed = Math.max(0, result.totalCalls - result.resolved);
  const callsAnswered = result.resolved;
  const successRate =
    result.totalCalls > 0 ? round1((callsAnswered / result.totalCalls) * 100) : 0;

  const peakHour = peakHourAgg[0]?._id as number | undefined;
  const formatPeak = (h: number | undefined) => {
    if (h === undefined || h === null) return "N/A";
    const startHour = h % 12 || 12;
    const endH = (h + 1) % 24;
    const endHour = endH % 12 || 12;
    const startAmpm = h < 12 ? "AM" : "PM";
    const endAmpm = endH < 12 ? "AM" : "PM";
    const pad = (n: number) => String(n).padStart(2, "0");
    if (startAmpm === endAmpm) {
      return `${pad(startHour)}:00 - ${pad(endHour)}:00 ${endAmpm}`;
    }
    return `${pad(startHour)}:00 ${startAmpm} - ${pad(endHour)}:00 ${endAmpm}`;
  };

  return {
    totalCalls: result.totalCalls,
    callsAnswered,
    callsMissed,
    successRate,
    avgTalkTime: formatDuration(
      result.resolvedCount > 0 ? result.totalTalkMs / result.resolvedCount : 0,
    ),
    avgWaitTime: "0s",
    peakHour: formatPeak(peakHour),
    activeAgents,
    totalAgents,
    ivrCompletionRate:
      result.totalCalls > 0
        ? round1((result.slaCompliant / result.totalCalls) * 100)
        : 0,
  };
}

async function getAgentPerformanceReport(match: Record<string, unknown>) {
  const agentRoles = await Role.find({
    level: { $in: ["CCE", "Supervisor"] },
  })
    .select("_id")
    .lean();

  if (agentRoles.length === 0) return [];

  const roleIds = agentRoles.map((r) => r._id);

  const agents = await User.find({ role: { $in: roleIds }, status: "ACTIVE" })
    .select("name isBreak role")
    .lean();

  if (agents.length === 0) return [];

  const agentIds = agents.map((a) => a._id);

  const rows = await Grievance.aggregate([
    {
      $match: {
        ...match,
        createdBy: { $in: agentIds },
      },
    },
    {
      $group: {
        _id: "$createdBy",
        calls: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $in: ["$status", ["RESOLVED", "CLOSED"]] }, 1, 0] },
        },
        slaCompliant: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$escalationLevel", 0] },
                  { $eq: ["$escalationLevel", null] },
                  { $not: ["$escalationLevel"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        ratingSum: {
          $sum: { $cond: [{ $ifNull: ["$rating", false] }, "$rating", 0] },
        },
        ratingCount: {
          $sum: { $cond: [{ $ifNull: ["$rating", false] }, 1, 0] },
        },
        totalTalkMs: {
          $sum: {
            $cond: [
              { $in: ["$status", ["RESOLVED", "CLOSED"]] },
              { $subtract: ["$updatedAt", "$createdAt"] },
              0,
            ],
          },
        },
      },
    },
  ]);

  const statsByAgent = new Map(rows.map((r) => [r._id.toString(), r]));
  const activeUsers = [
    ...ActivityService.getActiveUsers("CCE").users,
    ...ActivityService.getActiveUsers("Supervisor").users,
  ];
  const activeSet = new Set(activeUsers.map((u) => u.userId));

  return agents
    .map((agent) => {
      const id = agent._id.toString();
      const stats = statsByAgent.get(id);
      const calls = stats?.calls || 0;
      const resolved = stats?.resolved || 0;
      const slaCompliant = stats?.slaCompliant || 0;
      const ratingCount = stats?.ratingCount || 0;
      const ratingSum = stats?.ratingSum || 0;
      const totalTalkMs = stats?.totalTalkMs || 0;

      let status: "Online" | "On Break" | "Offline" = "Offline";
      if (agent.isBreak) status = "On Break";
      else if (activeSet.has(id)) status = "Online";

      return {
        agent: agent.name,
        calls,
        resolved,
        avgTalkTime: formatDuration(resolved > 0 ? totalTalkMs / resolved : 0),
        csat: ratingCount > 0 ? round1(ratingSum / ratingCount) : 0,
        slaCompliance: calls > 0 ? round1((slaCompliant / calls) * 100) : 0,
        status,
      };
    })
    .sort((a, b) => b.resolved - a.resolved || b.calls - a.calls);
}

export class MisService {
  static getDataKey(report: ReportType): string {
    return REPORT_DATA_KEYS[report];
  }

  static async getReport(params: MisQueryParams) {
    const {
      report,
      district = "all",
      dateRange = "fy",
      fromDate,
      toDate,
    } = params;

    if (!VALID_REPORTS.includes(report)) {
      throw new ApiError({ status: 400, message: "Invalid report type" });
    }

    const bounds = resolveDateRange(dateRange, fromDate, toDate);
    const match = buildBaseMatch(district, bounds);

    let payload: unknown;

    switch (report) {
      case REPORT.SUMMARY:
        payload = await getSummaryReport(match);
        break;
      case REPORT.OFFICER:
        payload = await getOfficerRankingReport(match);
        break;
      case REPORT.SERVICE:
        payload = await getServicePerformanceReport(match);
        break;
      case REPORT.URBAN:
      case REPORT.ULB:
        payload = await getUlbWiseReport(match, bounds);
        break;
      case REPORT.RURAL:
        payload = await getBlockWiseReport(match);
        break;
      case REPORT.IVR:
        payload = await getIvrStatsReport(match);
        break;
      case REPORT.AGENT:
        payload = await getAgentPerformanceReport(match);
        break;
      default:
        throw new ApiError({ status: 400, message: "Invalid report type" });
    }

    const dataKey = REPORT_DATA_KEYS[report];

    return {
      report,
      district: district || "all",
      dateRange: dateRange || "fy",
      fromDate: dateRange === "custom" ? fromDate || null : null,
      toDate: dateRange === "custom" ? toDate || null : null,
      [dataKey]: payload,
    };
  }
}
