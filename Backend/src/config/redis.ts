import Redis from 'ioredis';
import { env } from './env';

export const redisConfig = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redis = new Redis(env.REDIS_URL, redisConfig);

redis.on('connect', () => {
  console.log('Redis connected successfully.');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
