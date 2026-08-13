import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { RefundService } from '../../application/services/refund.service.js';

export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  async approveRefund(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: number; provider?: string };
    if (typeof body.amount !== 'number' || !Number.isFinite(body.amount)) {
      return reply.status(400).send({ message: 'amount is required.' });
    }
    try {
      const refund = await this.refundService.issueForReturn(id, body.amount, body.provider);
      return reply.status(201).send({ refund });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.refundService.list(page, limit);
    return reply.send({ refunds: result.refunds, total: result.total, page, limit });
  }

  async adminGet(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const refund = await this.refundService.getById(id);
    if (!refund) {
      return reply.status(404).send({ message: 'Refund not found.' });
    }
    return reply.send({ refund });
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string };
    if (!body.status) {
      return reply.status(400).send({ message: 'status is required.' });
    }
    try {
      const refund = await this.refundService.updateStatus(id, body.status);
      return reply.send({ refund });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async listMine(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const refunds = await this.refundService.listByUser(userId);
    return reply.send({ refunds });
  }
}
