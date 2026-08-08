import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuditService } from '../../application/services/audit.service.js';

export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  async loginLogs(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { page?: string; limit?: string; search?: string; success?: 'true' | 'false' };
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));

    const result = await this.auditService.listLoginLogs({
      page,
      limit,
      search: query.search,
      success: query.success
    });

    return reply.send({ logs: result.logs, pagination: { page, limit, total: result.total } });
  }
}
