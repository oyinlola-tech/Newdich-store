import type { PrismaClient } from '@prisma/client';

export class SearchLogService {
  constructor(private readonly prisma: PrismaClient) {}

  async log(query: string, userId?: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      await this.prisma.searchLog.create({ data: { query: trimmed.slice(0, 200), userId: userId ?? null } });
    } catch (error) {
      // Logging is best-effort; never fail a search because logging failed.
    }
  }

  async topSearches(days = 30, limit = 20) {
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
