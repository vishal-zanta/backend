import { redisSet, redisGet, redisKeys } from '../../libs/redis.lib.js';

interface ActivityPulseData {
  userId: string;
  roleLevel: string;
  lastActive: Date;
  isActiveOnScreen: boolean;
  screenState: 'ACTIVE' | 'IDLE' | 'BACKGROUND';
}

const PULSE_TTL_SECONDS = 60; // 1 minute TTL in Redis

export class ActivityService {
  /**
   * Record a user's activity pulse in Redis with browser-level active presence check
   * @param userId user id
   * @param roleLevel role level (e.g. from user role)
   * @param isActiveOnScreen browser screen focus check (true = tab visible/focused)
   * @param screenState ACTIVE, IDLE, or BACKGROUND
   */
  static async recordPulse(
    userId: string,
    roleLevel: string,
    isActiveOnScreen: boolean = true,
    screenState?: 'ACTIVE' | 'IDLE' | 'BACKGROUND'
  ): Promise<void> {
    const effectiveState = screenState || (isActiveOnScreen ? 'ACTIVE' : 'BACKGROUND');
    const data: ActivityPulseData = {
      userId,
      roleLevel,
      lastActive: new Date(),
      isActiveOnScreen: isActiveOnScreen !== false,
      screenState: effectiveState,
    };

    // Store in Redis with TTL of 60 seconds
    await Promise.all([
      redisSet(`activity:pulse:${roleLevel}:${userId}`, data, PULSE_TTL_SECONDS),
      redisSet(`activity:user:${userId}`, data, PULSE_TTL_SECONDS),
    ]);
  }

  /**
   * Get single user's real-time presence and screen status from Redis
   */
  static async getUserActivity(userId: string): Promise<{
    isOnline: boolean;
    lastActive: Date | null;
    isActiveOnScreen: boolean;
    screenState: 'ACTIVE' | 'IDLE' | 'BACKGROUND' | 'OFFLINE';
  }> {
    const data = await redisGet<ActivityPulseData>(`activity:user:${userId}`);
    if (data) {
      return {
        isOnline: true,
        lastActive: data.lastActive ? new Date(data.lastActive) : new Date(),
        isActiveOnScreen: data.isActiveOnScreen !== false,
        screenState: data.screenState || (data.isActiveOnScreen !== false ? 'ACTIVE' : 'BACKGROUND'),
      };
    }
    return {
      isOnline: false,
      lastActive: null,
      isActiveOnScreen: false,
      screenState: 'OFFLINE',
    };
  }

  /**
   * Get all active users from Redis, optionally filtered by roleLevel
   * @param filterRoleLevel optional role level to filter by (e.g. CCE, Supervisor)
   * @returns object containing active users array and total count
   */
  static async getActiveUsers(filterRoleLevel?: string): Promise<{
    count: number;
    users: Array<{
      userId: string;
      roleLevel: string;
      lastActive: Date;
      isActiveOnScreen: boolean;
      screenState: string;
    }>;
  }> {
    const pattern = filterRoleLevel
      ? `activity:pulse:${filterRoleLevel}:*`
      : 'activity:pulse:*';

    const keys = await redisKeys(pattern);
    const activeUsers = [];

    for (const key of keys) {
      const data = await redisGet<ActivityPulseData>(key);
      if (data) {
        activeUsers.push({
          userId: data.userId,
          roleLevel: data.roleLevel,
          lastActive: data.lastActive ? new Date(data.lastActive) : new Date(),
          isActiveOnScreen: data.isActiveOnScreen !== false,
          screenState: data.screenState || 'ACTIVE',
        });
      }
    }

    return {
      count: new Set(activeUsers.map((u) => u.userId)).size,
      users: activeUsers,
    };
  }
}
