import { redis } from '../config/redis';

export class CacheService {
  /**
   * Retrieves a string value by key.
   */
  public static async get(key: string): Promise<string | null> {
    return redis.get(key);
  }

  /**
   * Stores a string value with a specific TTL (time-to-live) in seconds.
   */
  public static async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await redis.set(key, value, 'EX', ttlSeconds);
  }

  /**
   * Deletes a key from the cache store.
   */
  public static async del(key: string): Promise<void> {
    await redis.del(key);
  }

  /**
   * Checks if a key exists in the cache store.
   */
  public static async exists(key: string): Promise<boolean> {
    const count = await redis.exists(key);
    return count === 1;
  }
}
