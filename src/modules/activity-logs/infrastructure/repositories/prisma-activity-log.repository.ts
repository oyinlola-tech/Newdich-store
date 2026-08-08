import type { PrismaClient } from '@prisma/client';

export class PrismaActivityLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { actorType: string; actorId?: string; action: string; targetType?: string; targetId?: string; metadata?: unknown; ip?: string; userAgent?: string }) {
    return this.prisma.activityLog.create({ data: data as never });
  }

  async findMany(where: Record<string, unknown>, skip: number, take: number) {
    return this.prisma.activityLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take });
  }

  async count(where: Record<string, unknown>) {
    return this.prisma.activityLog.count({ where });
  }
}
