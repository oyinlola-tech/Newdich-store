import type { PrismaClient } from '@prisma/client';

export interface AuditListFilters {
  page: number;
  limit: number;
  search?: string;
  success?: 'true' | 'false' | undefined;
}

export class AuditService {
  constructor(private readonly prisma: PrismaClient) {}

  async listLoginLogs(filters: AuditListFilters) {
    const where: Record<string, unknown> = {};
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search } },
        { ip: { contains: filters.search } }
      ];
    }
    if (filters.success === 'true' || filters.success === 'false') {
      where.success = filters.success === 'true';
    }

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.loginLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.loginLog.count({ where })
    ]);

    return { logs, total };
  }
}
