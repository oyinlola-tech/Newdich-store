import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { InventoryService } from '../../application/services/inventory.service.js';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { page?: string; limit?: string; lowStock?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);

    if (query.lowStock === 'true') {
      const items = await this.inventoryService.listLowStock(10);
      return reply.send({ inventory: items, lowStock: true });
    }

    const result = await this.inventoryService.list(page, limit);
    return reply.send({ inventory: result.items, total: result.total, page, limit });
  }

  async getByVariant(request: FastifyRequest, reply: FastifyReply) {
    const { variantId } = request.params as { variantId: string };
    const inventory = await this.inventoryService.getByVariantId(variantId);
    if (!inventory) {
      return reply.status(404).send({ message: 'Inventory record not found.' });
    }
    return reply.send({ inventory });
  }

  async getByProduct(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const inventory = await this.inventoryService.getByProductId(productId);
    if (!inventory) {
      return reply.status(404).send({ message: 'Inventory record not found.' });
    }
    return reply.send({ inventory });
  }

  async check(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { productId?: string; quantity?: number };
    if (!body.productId || typeof body.quantity !== 'number' || body.quantity < 1) {
      return reply.status(400).send({ message: 'productId and quantity (>= 1) are required.' });
    }
    return reply.send(await this.inventoryService.checkAvailability(body.productId, body.quantity));
  }

  async updateByProduct(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const body = request.body as { quantity?: number; reason?: string; stock?: number };
    const quantity = typeof body.quantity === 'number' ? body.quantity : body.stock;
    if (typeof quantity !== 'number' || quantity < 0) {
      return reply.status(400).send({ message: 'quantity must be a non-negative number.' });
    }
    const inventory = await this.inventoryService.updateByProductId(productId, quantity, body.reason);
    return reply.send({ inventory });
  }

  async adjust(request: FastifyRequest, reply: FastifyReply) {
    const { variantId } = request.params as { variantId: string };
    const body = request.body as { quantity?: number; reason?: string };
    if (typeof body.quantity !== 'number' || body.quantity < 0) {
      return reply.status(400).send({ message: 'quantity must be a non-negative number.' });
    }
    const inventory = await this.inventoryService.adjustStock(variantId, body.quantity, body.reason);
    return reply.send({ inventory });
  }
}
