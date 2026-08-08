import type { CachePort } from '../../application/ports/cache.port.js';
import { appConfig } from '../../../config/index.js';

export class RedisCacheProvider implements CachePort {
  private readonly client: import('ioredis').Redis | null = null;

  constructor() {
    try {
      const Redis = require('ioredis');
      if (appConfig.REDIS_URL) {
        this.client = new Redis(appConfig.REDIS_URL, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false
        });
        this.client.on('error', () => {});
      }
    } catch {
      // Redis not available — cache becomes a no-op
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // ignore cache failures
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch {
      // ignore cache failures
    }
  }
}
