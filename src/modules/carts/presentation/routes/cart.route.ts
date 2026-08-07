import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { CartController } from '../controllers/cart.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';

export function registerCartRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<CartController>('cart.controller');
  const auth = authenticate(container);

  app.get('/cart', { preHandler: [auth] }, controller.get.bind(controller));
  app.post('/cart/items', { preHandler: [auth] }, controller.addItem.bind(controller));
  app.put('/cart/items/:itemId', { preHandler: [auth] }, controller.updateItem.bind(controller));
  app.delete('/cart/items/:itemId', { preHandler: [auth] }, controller.removeItem.bind(controller));
  app.delete('/cart', { preHandler: [auth] }, controller.clear.bind(controller));
}
