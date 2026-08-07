import type { FastifyReply, FastifyRequest } from 'fastify';
import type { WishlistService } from '../../application/services/wishlist.service.js';

export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  async get(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const items = await this.wishlistService.list(userId);
    return reply.send({ items });
  }

  async add(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const body = request.body as { productId?: string };
    if (!body.productId) {
      return reply.status(400).send({ message: 'productId is required.' });
    }
    const items = await this.wishlistService.add(userId, body.productId);
    return reply.status(201).send({ items });
  }

  async toggle(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const body = request.body as { productId?: string };
    if (!body.productId) {
      return reply.status(400).send({ message: 'productId is required.' });
    }
    return reply.send(await this.wishlistService.toggle(userId, body.productId));
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { itemId } = request.params as { itemId: string };
    await this.wishlistService.remove(userId, itemId);
    return reply.send({ message: 'Item removed from wishlist.' });
  }
}
