import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaDiscountRepository } from './infrastructure/repositories/prisma-discount.repository.js';
import { DiscountService } from './application/services/discount.service.js';
import { DiscountController } from './presentation/controllers/discount.controller.js';
import { registerDiscountRoutes } from './presentation/routes/discount.route.js';

export function registerDiscountsModule(container: Container, app: FastifyInstance): void {
  container.register('discount.repository', (c) => new PrismaDiscountRepository(c.get('prisma')));
  container.register('discount.service', (c) => new DiscountService(c.get('discount.repository')));
  container.register('discount.controller', (c) => new DiscountController(c.get('discount.service')));

  registerDiscountRoutes(app, container);
}
