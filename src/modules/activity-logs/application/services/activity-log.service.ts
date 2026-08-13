import type { PrismaActivityLogRepository } from '../../infrastructure/repositories/prisma-activity-log.repository.js';

export class ActivityLogService {
  constructor(private readonly repository: PrismaActivityLogRepository) {}

  async log(input: { actorType: string; actorId?: string; action: string; targetType?: string; targetId?: string; metadata?: unknown; ip?: string; userAgent?: string }) {
    await this.repository.create({
      actorType: input.actorType,
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata as never,
      ip: input.ip,
      userAgent: input.userAgent
    });
  }

  async list(filters: { actorType?: string; action?: string; page: number; limit: number }) {
    const where: Record<string, unknown> = {};
    if (filters.actorType) where.actorType = filters.actorType;
    if (filters.action) where.action = { contains: filters.action };

    const [logs, total] = await Promise.all([
      this.repository.findMany(where, (filters.page - 1) * filters.limit, filters.limit),
      this.repository.count(where)
    ]);
    return { logs, total };
  }
}
