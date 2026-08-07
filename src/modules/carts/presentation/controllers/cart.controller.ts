import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CartService } from '../../application/services/cart.service.js';
// removed
// import type { ProductRepositoryPort } from '../../../products/application/ports/product.repository.js';

export class CartController {
  constructor(private readonly cartService: CartService) {}

  async get(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { cart, items } = await this.cartService.getCart(userId);

    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.product.price) + Number(item.variant?.priceDelta ?? 0);
      return sum + price * item.quantity;
    }, 0);

    return reply.send({
      cart: { id: cart.id, subtotal, count: items.reduce((acc, item) => acc + item.quantity, 0) },
      items: items.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price
        },
        variant: item.variant
          ? { id: item.variant.id, name: item.variant.name, sku: item.variant.sku }
          : null,
        quantity: item.quantity,
        lineTotal: (Number(item.product.price) + Number(item.variant?.priceDelta ?? 0)) * item.quantity
      }))
    });
  }

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const body = request.body as { productId?: string; variantId?: string; quantity?: number };
    if (!body.productId) {
      return reply.status(400).send({ message: 'productId is required.' });
    }
    const quantity = body.quantity ?? 1;
    try {
      const item = await this.cartService.addItem(userId, body.productId, quantity, body.variantId);
      return reply.status(201).send({ item });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async updateItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { itemId } = request.params as { itemId: string };
    const body = request.body as { quantity?: number };
    if (typeof body.quantity !== 'number') {
      return reply.status(400).send({ message: 'quantity is required.' });
    }
    try {
      const item = await this.cartService.updateQuantity(userId, itemId, body.quantity);
      return reply.send({ item });
    } catch (error) {
      return reply.status(404).send({ message: (error as Error).message });
    }
  }

  async removeItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { itemId } = request.params as { itemId: string };
    await this.cartService.removeItem(userId, itemId);
    return reply.send({ message: 'Item removed from cart.' });
  }

  async clear(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    await this.cartService.clear(userId);
    return reply.send({ message: 'Cart cleared.' });
  }
}
