import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaSeoRepository } from './infrastructure/repositories/prisma-seo.repository.js';
import { SeoService } from './application/services/seo.service.js';
import { SeoController } from './presentation/controllers/seo.controller.js';
import { registerSeoRoutes } from './presentation/routes/seo.route.js';

export function registerSeoModule(container: Container, app: FastifyInstance): void {
  container.register('seo.repository', (c) => new PrismaSeoRepository(c.get('prisma')));
  container.register('seo.service', (c) => new SeoService(c.get('seo.repository')));
  container.register('seo.controller', (c) => new SeoController(c.get('seo.service')));

  registerSeoRoutes(app, container);
}
