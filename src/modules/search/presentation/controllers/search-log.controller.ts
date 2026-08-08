import type { FastifyReply, FastifyRequest } from 'fastify';
import type { SearchLogService } from '../../application/services/search-log.service.js';

export class SearchLogController {
  constructor(private readonly searchLogService: SearchLogService) {}

  async topSearches(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { days?: string; limit?: string };
    const days = Math.min(90, Math.max(1, Number(query.days ?? 30)));
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
    const terms = await this.searchLogService.topSearches(days, limit);
    return reply.send({ terms, days });
  }
}
