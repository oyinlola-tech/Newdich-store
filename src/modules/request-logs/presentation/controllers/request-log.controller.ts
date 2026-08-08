import type { FastifyReply, FastifyRequest } from 'fastify';
import type { RequestLogService } from '../../application/services/request-log.service.js';

export class RequestLogController {
  constructor(private readonly requestLogService: RequestLogService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { ip?: string; path?: string; page?: string; limit?: string };
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const result = await this.requestLogService.list({ ip: query.ip, path: query.path, page, limit });
    return reply.send({ logs: result.logs, pagination: { page, limit, total: result.total } });
  }
}
