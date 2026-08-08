import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { SearchLogController } from '../controllers/search-log.controller.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerSearchRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<SearchLogController>('search-log.controller');
  const admin = isAdmin(container);

  app.get('/admin/analytics/top-searches', { preHandler: [admin] }, controller.topSearches.bind(controller));
}
