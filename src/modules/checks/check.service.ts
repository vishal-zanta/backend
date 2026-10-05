import { Check } from "./check.model.js";

export interface MonitorTarget {
  name: string;
  url?: string;
}

export const DEFAULT_MONITOR_TARGETS: MonitorTarget[] = [
  {
    name: "Production Backend",
    url: "https://portal-backend.lumirex.tech/health",
  },
  {
    name: "Production Frontend",
    url: "https://portal.lumirex.tech",
  },
  {
    name: "CITIZEN Frontend",
    url: "https://citizen.lumirex.tech",
  },
  {
    name: "AVAYA Backend",
    url: "https://avaya.lumirex.tech/health",
  },
];

export function formatDuration(ms: number): string {
  if (ms <= 0) return "0s";
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

  return parts.join(" ");
}

export function formatTimeAgo(date: Date): string {
  const diffMs = Math.max(0, Date.now() - new Date(date).getTime());
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export class CheckService {
  /**
   * Get monitoring summary for each target:
   * - Latest check status (UP / DOWN)
   * - Uptime calculation: time elapsed since last DOWN check. If currently DOWN, uptime is 0.
   * - Most recent DOWN check details
   * - Sparkline history (recent 10 checks)
   */
  static async getMonitoringSummary() {
    // Collect distinct service names from DB and ensure default targets are included
    const dbNames = await Check.distinct("name");
    const targetMap = new Map<string, string | undefined>();

    DEFAULT_MONITOR_TARGETS.forEach((t) => targetMap.set(t.name, t.url));
    dbNames.forEach((name) => {
      if (!targetMap.has(name)) {
        targetMap.set(name, undefined);
      }
    });

    const targets = Array.from(targetMap.entries()).map(([name, defaultUrl]) => ({
      name,
      defaultUrl,
    }));

    const services = await Promise.all(
      targets.map(async ({ name, defaultUrl }) => {
        // 1. Fetch latest check
        const latestCheck = await Check.findOne({ name })
          .sort({ checkedAt: -1 })
          .lean();

        // 2. Fetch latest DOWN check
        const lastDownCheck = await Check.findOne({
          name,
          status: "DOWN",
        })
          .sort({ checkedAt: -1 })
          .lean();

        // 3. Fetch recent 10 checks for trend
        const recentHistory = await Check.find({ name })
          .sort({ checkedAt: -1 })
          .limit(10)
          .select("status statusCode responseTimeMs error checkedAt")
          .lean();

        const url = latestCheck?.url || defaultUrl || "";

        if (!latestCheck) {
          return {
            name,
            url,
            status: "UNKNOWN",
            isUp: false,
            statusCode: null,
            responseTimeMs: 0,
            checkedAt: null,
            uptimeMs: 0,
            uptimeSeconds: 0,
            uptimeFormatted: "0s",
            upSince: null,
            lastDown: null,
            recentHistory: [],
          };
        }

        const isCurrentlyUp = latestCheck.status === "UP";
        let uptimeMs = 0;
        let upSince: Date | null = null;

        if (!isCurrentlyUp) {
          // If latest is DOWN, show 0 because it is down now
          uptimeMs = 0;
        } else {
          // If latest is UP, check time since last DOWN
          if (lastDownCheck) {
            upSince = lastDownCheck.checkedAt;
            uptimeMs = Math.max(0, Date.now() - new Date(lastDownCheck.checkedAt).getTime());
          } else {
            // Never recorded down: find earliest check
            const firstCheck = await Check.findOne({ name })
              .sort({ checkedAt: 1 })
              .lean();
            upSince = firstCheck?.checkedAt || latestCheck.checkedAt;
            uptimeMs = Math.max(0, Date.now() - new Date(upSince).getTime());
          }
        }

        const lastDown = lastDownCheck
          ? {
              _id: lastDownCheck._id,
              checkedAt: lastDownCheck.checkedAt,
              statusCode: lastDownCheck.statusCode,
              error: lastDownCheck.error,
              responseTimeMs: lastDownCheck.responseTimeMs,
              timeAgo: formatTimeAgo(lastDownCheck.checkedAt),
            }
          : null;

        return {
          name,
          url,
          status: latestCheck.status,
          isUp: isCurrentlyUp,
          statusCode: latestCheck.statusCode,
          responseTimeMs: latestCheck.responseTimeMs,
          checkedAt: latestCheck.checkedAt,
          error: latestCheck.error,
          uptimeMs,
          uptimeSeconds: Math.floor(uptimeMs / 1000),
          uptimeFormatted: formatDuration(uptimeMs),
          upSince,
          lastDown,
          recentHistory: recentHistory.reverse(),
        };
      })
    );

    const totalTargets = services.length;
    const upTargets = services.filter((s) => s.status === "UP").length;
    const downTargets = services.filter((s) => s.status === "DOWN").length;

    let overallStatus: "ALL_UP" | "DEGRADED" | "ALL_DOWN" = "ALL_UP";
    if (downTargets === totalTargets && totalTargets > 0) {
      overallStatus = "ALL_DOWN";
    } else if (downTargets > 0) {
      overallStatus = "DEGRADED";
    }

    return {
      overallStatus,
      totalTargets,
      upTargets,
      downTargets,
      checkedAt: new Date(),
      services,
    };
  }

  /**
   * Fetch down documents with pagination and optional filter by target name
   */
  static async getDownDocs(options: { name?: string; page?: number; limit?: number }) {
    const { name, page = 1, limit = 20 } = options;

    const query: any = { status: "DOWN" };
    if (name) {
      query.name = name;
    }

    const total = await Check.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const rawDocs = await Check.find(query)
      .sort({ checkedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const docs = rawDocs.map((doc) => ({
      ...doc,
      timeAgo: formatTimeAgo(doc.checkedAt),
    }));

    // Find the latest down check for each distinct service
    const serviceNames = await Check.distinct("name");
    const latestDownPerService = await Promise.all(
      serviceNames.map(async (serviceName) => {
        const lastDown = await Check.findOne({ name: serviceName, status: "DOWN" })
          .sort({ checkedAt: -1 })
          .lean();

        return {
          name: serviceName,
          lastDown: lastDown
            ? {
                ...lastDown,
                timeAgo: formatTimeAgo(lastDown.checkedAt),
              }
            : null,
        };
      })
    );

    return {
      docs,
      latestDownPerService,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Fetch check history with optional name, status, and pagination
   */
  static async getHistory(options: {
    name?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { name, status, page = 1, limit = 50 } = options;

    const query: any = {};
    if (name) query.name = name;
    if (status && status !== "ALL") query.status = status;

    const total = await Check.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const docs = await Check.find(query)
      .sort({ checkedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      docs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
