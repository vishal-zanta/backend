import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isReady = false;

// Fallback memory store in case Redis is temporarily disconnected
const memoryFallback = new Map<string, { value: string; expiresAt: number | null }>();

export const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL ;

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 3) {
            return false; // Stop reconnecting after 3 attempts
          }
          return Math.min(retries * 200, 1000);
        },
        connectTimeout: 2000,
      },
    });

    redisClient.on('error', (err) => {
      isReady = false;
    });

    redisClient.on('ready', () => {
      console.log(`Redis connected successfully !! [${redisUrl}]`);
      isReady = true;
    });

    redisClient.on('end', () => {
      isReady = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error: any) {
    console.warn(`[Redis] Connection Notice: Redis server not reachable at ${redisUrl}. Utilizing fast fallback cache.`);
    isReady = false;
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const isRedisAvailable = (): boolean => {
  return isReady && redisClient !== null && redisClient.isOpen;
};

/**
 * Set key with optional TTL (in seconds)
 */
export const redisSet = async (key: string, value: any, ttlSeconds?: number): Promise<void> => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

  if (isRedisAvailable()) {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await redisClient!.set(key, stringValue, { EX: ttlSeconds });
      } else {
        await redisClient!.set(key, stringValue);
      }
      return;
    } catch (err: any) {
      console.warn(`[Redis] Error setting key ${key}: ${err.message}`);
    }
  }

  // Fallback
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  memoryFallback.set(key, { value: stringValue, expiresAt });
};

/**
 * Get value by key
 */
export const redisGet = async <T = any>(key: string): Promise<T | null> => {
  if (isRedisAvailable()) {
    try {
      const data = await redisClient!.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data) as T;
      } catch {
        return data as unknown as T;
      }
    } catch (err: any) {
      console.warn(`[Redis] Error getting key ${key}: ${err.message}`);
    }
  }

  // Fallback
  const item = memoryFallback.get(key);
  if (!item) return null;

  if (item.expiresAt && Date.now() > item.expiresAt) {
    memoryFallback.delete(key);
    return null;
  }

  try {
    return JSON.parse(item.value) as T;
  } catch {
    return item.value as unknown as T;
  }
};

/**
 * Find keys matching a pattern
 */
export const redisKeys = async (pattern: string): Promise<string[]> => {
  if (isRedisAvailable()) {
    try {
      return await redisClient!.keys(pattern);
    } catch (err: any) {
      console.warn(`[Redis] Error getting keys for ${pattern}: ${err.message}`);
    }
  }

  // Fallback: match simple pattern (e.g. prefix:*)
  const now = Date.now();
  const matched: string[] = [];
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);

  for (const [key, item] of memoryFallback.entries()) {
    if (item.expiresAt && now > item.expiresAt) {
      memoryFallback.delete(key);
      continue;
    }
    if (regex.test(key)) {
      matched.push(key);
    }
  }

  return matched;
};

/**
 * Delete key
 */
export const redisDel = async (key: string): Promise<void> => {
  if (isRedisAvailable()) {
    try {
      await redisClient!.del(key);
      return;
    } catch (err: any) {
      console.warn(`[Redis] Error deleting key ${key}: ${err.message}`);
    }
  }

  memoryFallback.delete(key);
};
