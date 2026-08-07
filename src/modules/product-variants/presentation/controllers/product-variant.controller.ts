import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ProductVariantService } from '../../application/services/product-variant.service.js';

export class ProductVariantController {
  constructor(private readonly variantService: ProductVariantService) {}

  async listByProduct(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const variants = await this.variantService.getByProductId(productId);
    return reply.send({ variants });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const body = request.body as {
      name?: string;
      sku?: string;
      attributes?: Record<string, unknown>;
      priceDelta?: number;
      stock?: number;
    };
    if (!body.name || typeof body.name !== 'string') {
      return reply.status(400).send({ message: 'name is required.' });
    }
    if (body.priceDelta !== undefined && typeof body.priceDelta !== 'number') {
      return reply.status(400).send({ message: 'priceDelta must be a number.' });
    }
    if (body.stock !== undefined && (typeof body.stock !== 'number' || body.stock < 0)) {
      return reply.status(400).send({ message: 'stock must be a non-negative number.' });
    }
    const variant = await this.variantService.create(productId, {
      name: body.name,
      sku: body.sku,
      attributes: body.attributes,
      priceDelta: body.priceDelta,
      stock: typeof body.stock === 'number' ? body.stock : 0
    });
    return reply.status(201).send({ variant });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      sku?: string;
      attributes?: Record<string, unknown>;
      priceDelta?: number;
    };
    const variant = await this.variantService.update(id, {
      name: body.name,
      sku: body.sku,
      attributes: body.attributes,
      priceDelta: body.priceDelta
    });
    return reply.send({ variant });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.variantService.remove(id);
    return reply.send({ message: 'Variant deleted successfully.' });
  }
}
