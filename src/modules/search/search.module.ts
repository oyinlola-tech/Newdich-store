import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { SearchLogService } from './application/services/search-log.service.js';
import { SearchLogController } from './presentation/controllers/search-log.controller.js';
import { PrismaSearchLogRepository } from './infrastructure/repositories/prisma-search-log.repository.js';
import { registerSearchRoutes } from './presentation/routes/search.route.js';

export function registerSearchModule(container: Container, app: FastifyInstance): void {
  container.register('search-log.repository', (c) => new PrismaSearchLogRepository(c.get('prisma')));
  container.register('search-log.service', (c) => new SearchLogService(c.get('search-log.repository')));
  container.register('search-log.controller', (c) => new SearchLogController(c.get('search-log.service')));

  registerSearchRoutes(app, container);
}
