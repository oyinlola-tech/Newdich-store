import type { QueuePort } from '../../application/ports/queue.port.js';
import { appConfig } from '../../../config/index.js';

export class BullMQQueueProvider implements QueuePort {
  private readonly Queue: typeof import('bullmq').Queue | null = null;
  private readonly client: import('ioredis').Redis | null = null;

  constructor() {
    try {
      if (!appConfig.REDIS_URL) return;
      const Redis = require('ioredis');
      const { Queue } = require('bullmq');
      this.client = new Redis(appConfig.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false
      });
      this.client?.on('error', () => {});
      this.Queue = Queue;
    } catch {
      // BullMQ/Redis not available — queue becomes a no-op
    }
  }

  async enqueue(jobName: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.Queue || !this.client) return;
    try {
      const queue = new this.Queue(jobName, { connection: this.client });
      await queue.add(jobName, payload, { removeOnComplete: true, removeOnFail: true });
    } catch {
      // ignore queue failures
    }
  }
}
