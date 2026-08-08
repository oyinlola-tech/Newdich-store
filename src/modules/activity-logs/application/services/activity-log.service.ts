import type { PrismaClient } from '@prisma/client';

export class ActivityLogService {
  constructor(private readonly prisma: PrismaClient) {}

  async log(input: { actorType: string; actorId?: string; action: string; targetType?: string; targetId?: string; metadata?: unknown; ip?: string; userAgent?: string }) {
    await this.prisma.activityLog.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: input.metadata as never,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null
      }
    });
  }

  async list(filters: { actorType?: string; action?: string; page: number; limit: number }) {
    const where: Record<string, unknown> = {};
    if (filters.actorType) where.actorType = filters.actorType;
    if (filters.action) where.action = { contains: filters.action };

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }),
      this.prisma.activityLog.count({ where })
    ]);
    return { logs, total };
  }
}
