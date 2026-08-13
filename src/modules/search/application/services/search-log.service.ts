import type { SearchLogRepository } from '../../infrastructure/repositories/prisma-search-log.repository.js';

export class SearchLogService {
  constructor(private readonly repository: SearchLogRepository) {}

  async log(query: string, userId?: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      await this.repository.create({ query: trimmed, userId: userId ?? null });
    } catch {
      // Logging is best-effort; never fail a search because logging failed.
    }
  }

  async topSearches(days = 30, limit = 20) {
    return this.repository.topSearches(days, limit);
  }
}
