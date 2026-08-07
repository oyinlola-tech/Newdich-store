import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { AnalyticsController } from '../controllers/analytics.controller.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerAnalyticsRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<AnalyticsController>('analytics.controller');
  const admin = isAdmin(container);

  app.get('/admin/stats', { preHandler: [admin] }, controller.stats.bind(controller));
  app.get('/admin/orders/recent', { preHandler: [admin] }, controller.recentOrders.bind(controller));
  app.get('/admin/products/top', { preHandler: [admin] }, controller.topProducts.bind(controller));
}
