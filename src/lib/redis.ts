import Redis from "ioredis";

const getRedisClient = () => {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  return new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
};

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis = globalForRedis.redis || getRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

const LOCK_TTL = 600;

export async function acquireLock(key: string, userId: string): Promise<boolean> {
  const result = await redis.set(`lock:${key}`, userId, "EX", LOCK_TTL, "NX");
  return result === "OK";
}

export async function releaseLock(key: string, userId: string): Promise<boolean> {
  const currentHolder = await redis.get(`lock:${key}`);
  if (currentHolder === userId) {
    await redis.del(`lock:${key}`);
    return true;
  }
  return false;
}

export async function getLockHolder(key: string): Promise<string | null> {
  return redis.get(`lock:${key}`);
}

export async function getLockTTL(key: string): Promise<number> {
  return redis.ttl(`lock:${key}`);
}

export async function acquireMultiLocks(
  keys: string[],
  userId: string
): Promise<{ success: boolean; acquiredKeys: string[] }> {
  const acquiredKeys: string[] = [];

  for (const key of keys) {
    const acquired = await acquireLock(key, userId);
    if (!acquired) {
      for (const ak of acquiredKeys) {
        await releaseLock(ak, userId);
      }
      return { success: false, acquiredKeys: [] };
    }
    acquiredKeys.push(key);
  }

  return { success: true, acquiredKeys };
}

export async function releaseMultiLocks(keys: string[], userId: string): Promise<void> {
  for (const key of keys) {
    await releaseLock(key, userId);
  }
}
