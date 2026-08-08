import type { QueuePort } from '../../application/ports/queue.port.js';
import type { PrismaClient } from '@prisma/client';

export class DatabaseQueueProvider implements QueuePort {
  constructor(private readonly prisma: PrismaClient) {}

  async enqueue(jobName: string, payload: Record<string, unknown>): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO Job (name, payload, status, attempts, maxAttempts, createdAt, updatedAt)
      VALUES (${jobName}, ${JSON.stringify(payload)}, 'PENDING', 0, 3, NOW(), NOW())
    `;
  }
}
