import type { PrismaClient } from '@prisma/client';

export interface SearchLogRepository {
  create(data: { query: string; userId?: string | null }): Promise<void>;
  topSearches(days: number, limit: number): Promise<{ query: string; count: number }[]>;
}

export class PrismaSearchLogRepository implements SearchLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { query: string; userId?: string | null }): Promise<void> {
    await this.prisma.searchLog.create({ data: { query: data.query.slice(0, 200), userId: data.userId ?? null } });
  }

  async topSearches(days: number, limit: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const rows = await this.prisma.searchLog.groupBy({
      by: ['query'],
      where: { createdAt: { gte: since } },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit
    });

    return rows.map((row) => ({ query: row.query, count: Number(row._count.query) }));
  }
}
