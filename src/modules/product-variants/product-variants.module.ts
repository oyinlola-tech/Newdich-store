import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaProductVariantRepository } from './infrastructure/repositories/prisma-product-variant.repository.js';
import { ProductVariantService } from './application/services/product-variant.service.js';
import { ProductVariantController } from './presentation/controllers/product-variant.controller.js';
import { registerProductVariantRoutes } from './presentation/routes/product-variant.route.js';

export function registerProductVariantsModule(container: Container, app: FastifyInstance): void {
  container.register('product-variant.repository', (c) => new PrismaProductVariantRepository(c.get('prisma')));
  container.register('product-variant.service', (c) => new ProductVariantService(c.get('product-variant.repository')));
  container.register('product-variant.controller', (c) => new ProductVariantController(c.get('product-variant.service')));

  registerProductVariantRoutes(app, container);
}
