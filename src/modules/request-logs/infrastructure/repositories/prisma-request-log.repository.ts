import type { PrismaClient } from '@prisma/client';

export class PrismaRequestLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { ip: string; path: string; method: string; status: number; userId?: string; userAgent?: string }) {
    return this.prisma.requestLog.create({ data });
  }

  async findMany(where: Record<string, unknown>, skip: number, take: number) {
    return this.prisma.requestLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take });
  }

  async count(where: Record<string, unknown>) {
    return this.prisma.requestLog.count({ where });
  }
}
