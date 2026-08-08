import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ActivityLogService } from '../../application/services/activity-log.service.js';

export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { actorType?: string; action?: string; page?: string; limit?: string };
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const result = await this.activityLogService.list({ actorType: query.actorType, action: query.action, page, limit });
    return reply.send({ logs: result.logs, pagination: { page, limit, total: result.total } });
  }
}
