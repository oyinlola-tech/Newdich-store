import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaWishlistRepository } from './infrastructure/repositories/prisma-wishlist.repository.js';
import { WishlistService } from './application/services/wishlist.service.js';
import { WishlistController } from './presentation/controllers/wishlist.controller.js';
import { registerWishlistRoutes } from './presentation/routes/wishlist.route.js';

export function registerWishlistsModule(container: Container, app: FastifyInstance): void {
  container.register('wishlist.repository', (c) => new PrismaWishlistRepository(c.get('prisma')));
  container.register('wishlist.service', (c) => new WishlistService(c.get('wishlist.repository')));
  container.register('wishlist.controller', (c) => new WishlistController(c.get('wishlist.service')));

  registerWishlistRoutes(app, container);
}
