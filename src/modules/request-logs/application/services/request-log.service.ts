import type { PrismaClient } from '@prisma/client';

export class RequestLogService {
  constructor(private readonly prisma: PrismaClient) {}

  async log(input: { ip: string; path: string; method: string; status: number; userId?: string; userAgent?: string }) {
    await this.prisma.requestLog.create({
      data: {
        ip: input.ip,
        path: input.path,
        method: input.method,
        status: input.status,
        userId: input.userId ?? null,
        userAgent: input.userAgent ?? null
      }
    });
  }

  async list(filters: { ip?: string; path?: string; page: number; limit: number }) {
    const where: Record<string, unknown> = {};
    if (filters.ip) where.ip = filters.ip;
    if (filters.path) where.path = { contains: filters.path };

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.requestLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }),
      this.prisma.requestLog.count({ where })
    ]);
    return { logs, total };
  }
}
