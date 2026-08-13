import type { PrismaRequestLogRepository } from '../../infrastructure/repositories/prisma-request-log.repository.js';

export class RequestLogService {
  constructor(private readonly repository: PrismaRequestLogRepository) {}

  async log(input: { ip: string; path: string; method: string; status: number; userId?: string; userAgent?: string }) {
    await this.repository.create({
      ip: input.ip,
      path: input.path,
      method: input.method,
      status: input.status,
      userId: input.userId,
      userAgent: input.userAgent
    });
  }

  async list(filters: { ip?: string; path?: string; page: number; limit: number }) {
    const where: Record<string, unknown> = {};
    if (filters.ip) where.ip = filters.ip;
    if (filters.path) where.path = { contains: filters.path };

    const [logs, total] = await Promise.all([
      this.repository.findMany(where, (filters.page - 1) * filters.limit, filters.limit),
      this.repository.count(where)
    ]);
    return { logs, total };
  }
}
