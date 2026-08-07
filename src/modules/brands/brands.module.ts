import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaBrandRepository } from './infrastructure/repositories/prisma-brand.repository.js';
import { BrandService } from './application/services/brand.service.js';
import { BrandController } from './presentation/controllers/brand.controller.js';
import { registerBrandRoutes } from './presentation/routes/brand.route.js';

export function registerBrandsModule(container: Container, app: FastifyInstance): void {
  container.register('brand.repository', (c) => new PrismaBrandRepository(c.get('prisma')));
  container.register('brand.service', (c) => new BrandService(c.get('brand.repository')));
  container.register('brand.controller', (c) => new BrandController(c.get('brand.service')));

  registerBrandRoutes(app, container);
}
