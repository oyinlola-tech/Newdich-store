import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { ReturnService } from '../../application/services/return.service.js';

export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const body = request.body as { orderId?: string; reason?: string; detail?: string };
    if (!body.orderId || !body.reason) {
      return reply.status(400).send({ message: 'orderId and reason are required.' });
    }
    try {
      const returnRequest = await this.returnService.create(userId, {
        orderId: body.orderId,
        reason: body.reason,
        detail: body.detail
      });
      return reply.status(201).send({ return: returnRequest });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async listMine(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const returns = await this.returnService.listByUser(userId);
    return reply.send({ returns });
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { status?: string; search?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.returnService.list(
      { status: query.status, search: query.search?.trim() },
      page,
      limit
    );
    return reply.send({ returns: result.returns, total: result.total, page, limit });
  }

  async adminGet(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const returnRequest = await this.returnService.getById(id);
    if (!returnRequest) {
      return reply.status(404).send({ message: 'Return request not found.' });
    }
    return reply.send({ return: returnRequest });
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string };
    const allowedStatuses = ['REQUESTED', 'APPROVED', 'REJECTED', 'PICKED_UP', 'REFUNDED', 'CLOSED'];
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return reply.status(400).send({ message: `status must be one of: ${allowedStatuses.join(', ')}.` });
    }
    try {
      const returnRequest = await this.returnService.updateStatus(id, body.status);
      return reply.send({ return: returnRequest });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async addNote(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { text?: string };
    try {
      const returnRequest = await this.returnService.addNote(id, {
        text: body.text ?? '',
        by: 'admin'
      });
      return reply.send({ return: returnRequest });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async approveRefund(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: number; provider?: string };
    if (typeof body.amount !== 'number') {
      return reply.status(400).send({ message: 'amount is required.' });
    }
    try {
      const refund = await this.returnService.approveWithRefund(id, body.amount, body.provider);
      return reply.status(201).send({ refund });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async adminRefunds(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.returnService.listRefunds(page, limit);
    return reply.send({ refunds: result.refunds, total: result.total, page, limit });
  }
}
