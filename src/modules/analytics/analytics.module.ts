import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { AnalyticsService } from './application/services/analytics.service.js';
import { AnalyticsController } from './presentation/controllers/analytics.controller.js';
import { registerAnalyticsRoutes } from './presentation/routes/analytics.route.js';

export function registerAnalyticsModule(container: Container, app: FastifyInstance): void {
  container.register('analytics.service', (c) => new AnalyticsService(c.get('prisma')));
  container.register('analytics.controller', (c) => new AnalyticsController(c.get('analytics.service')));

  registerAnalyticsRoutes(app, container);
}
