import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { WishlistController } from '../controllers/wishlist.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';

export function registerWishlistRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<WishlistController>('wishlist.controller');
  const auth = authenticate(container);

  app.get('/wishlist', { preHandler: [auth] }, controller.get.bind(controller));
  app.post('/wishlist/items', { preHandler: [auth] }, controller.add.bind(controller));
  app.post('/wishlist/toggle', { preHandler: [auth] }, controller.toggle.bind(controller));
  app.delete('/wishlist/items/:itemId', { preHandler: [auth] }, controller.remove.bind(controller));
}
