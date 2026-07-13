import NodeCache from 'node-cache';

// Cache with 1 minute TTL (60 seconds) and check period every 10 seconds
const activityCache = new NodeCache({ stdTTL: 60, checkperiod: 10 });

export class ActivityService {
  /**
   * Record a user's activity pulse
   * @param userId user id
   * @param roleLevel role level (e.g. from user role)
   */
  static recordPulse(userId: string, roleLevel: string): void {
    const key = `${roleLevel}:${userId}`;
    activityCache.set(key, { lastActive: new Date() });
  }

  /**
   * Get active users, optionally filtered by roleLevel
   * @param filterRoleLevel optional role level to filter by
   * @returns object containing active users array and total count
   */
  static getActiveUsers(filterRoleLevel?: string): { count: number; users: Array<{ userId: string; roleLevel: string; lastActive: Date }> } {
    const keys = activityCache.keys();
    const activeUsers = [];

    for (const key of keys) {
      const data = activityCache.get<{ lastActive: Date }>(key);
      if (data) {
        const [roleLevel, userId] = key.split(':');
        if (!filterRoleLevel || filterRoleLevel === roleLevel) {
          activeUsers.push({
            userId,
            roleLevel,
            lastActive: data.lastActive,
          });
        }
      }
    }

    return {
      count: activeUsers.length,
      users: activeUsers
    };
  }
}
