import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaCartRepository } from './infrastructure/repositories/prisma-cart.repository.js';
import { CartService } from './application/services/cart.service.js';
import { CartController } from './presentation/controllers/cart.controller.js';
import { registerCartRoutes } from './presentation/routes/cart.route.js';

export function registerCartsModule(container: Container, app: FastifyInstance): void {
  container.register('cart.repository', (c) => new PrismaCartRepository(c.get('prisma')));
  container.register('cart.service', (c) => new CartService(c.get('cart.repository'), c.get('product.repository')));
  container.register('cart.controller', (c) => new CartController(c.get('cart.service')));

  registerCartRoutes(app, container);
}
