import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { DiscountService } from '../../application/services/discount.service.js';
import type { DiscountCreateInput } from '../../infrastructure/repositories/prisma-discount.repository.js';

export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as Partial<DiscountCreateInput>;
    try {
      const discount = await this.discountService.create({
        name: body.name ?? '',
        description: body.description,
        type: body.type ?? 'PERCENTAGE',
        value: body.value ?? 0,
        scope: body.scope ?? 'ALL',
        categoryId: body.categoryId,
        productId: body.productId,
        brandId: body.brandId,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        isActive: body.isActive
      });
      return reply.status(201).send({ discount });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { scope?: string; status?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.discountService.list(
      { scope: query.scope, status: query.status },
      page,
      limit
    );
    return reply.send({ discounts: result.discounts, total: result.total, page, limit });
  }

  async publicList(_request: FastifyRequest, reply: FastifyReply) {
    const discounts = await this.discountService.listActive();
    return reply.send({ discounts });
  }

  async adminGet(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const discount = await this.discountService.getById(id);
    if (!discount) {
      return reply.status(404).send({ message: 'Discount not found.' });
    }
    return reply.send({ discount });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<DiscountCreateInput>;
    try {
      const discount = await this.discountService.update(id, body);
      return reply.send({ discount });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      await this.discountService.remove(id);
      return reply.send({ message: 'Discount deleted.' });
    } catch {
      return reply.status(400).send({ message: 'Unable to delete discount.' });
    }
  }
}
