import type { PrismaClient } from '@prisma/client';
import type { AppLogger } from '../logger/logger.service.js';

export class DatabaseJobProcessor {
  private readonly handlers = new Map<string, (payload: Record<string, unknown>) => Promise<void>>();

  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: AppLogger
  ) {}

  registerHandler(name: string, handler: (payload: Record<string, unknown>) => Promise<void>): void {
    this.handlers.set(name, handler);
  }

  async processPendingJobs(): Promise<void> {
    const jobs = await this.prisma.$queryRaw`
      SELECT * FROM Job WHERE status = 'PENDING' AND scheduledAt <= NOW() ORDER BY createdAt ASC LIMIT 10
    ` as Array<{
      id: string;
      name: string;
      payload: unknown;
      attempts: number;
      maxAttempts: number;
    }>;

    for (const job of jobs) {
      await this.processJob(job);
    }
  }

  private async processJob(job: {
    id: string;
    name: string;
    payload: unknown;
    attempts: number;
    maxAttempts: number;
  }): Promise<void> {
    const handler = this.handlers.get(job.name);
    if (!handler) {
      await this.prisma.$executeRaw`
        UPDATE Job SET status = 'FAILED', lastError = ${`No handler registered for job: ${job.name}`}, attempts = ${job.attempts + 1} WHERE id = ${job.id}
      `;
      return;
    }

    await this.prisma.$executeRaw`
      UPDATE Job SET status = 'PROCESSING', lockedAt = NOW() WHERE id = ${job.id}
    `;

    try {
      await handler(job.payload as Record<string, unknown>);
      await this.prisma.$executeRaw`
        UPDATE Job SET status = 'COMPLETED', completedAt = NOW() WHERE id = ${job.id}
      `;
    } catch (error) {
      const nextAttempts = job.attempts + 1;
      const shouldRetry = nextAttempts < job.maxAttempts;
      const status = shouldRetry ? 'PENDING' : 'FAILED';
      const scheduledAt = shouldRetry ? new Date(Date.now() + 60000 * nextAttempts) : null;
      const lastError = error instanceof Error ? error.message : 'Unknown error';
      await this.prisma.$executeRaw`
        UPDATE Job SET status = ${status}, attempts = ${nextAttempts}, lastError = ${lastError}, lockedAt = ${scheduledAt ? null : undefined}, scheduledAt = ${scheduledAt} WHERE id = ${job.id}
      `;
      this.logger.error({ jobId: job.id, error }, 'job processing failed');
    }
  }
}
