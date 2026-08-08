import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { SeoController } from '../controllers/seo.controller.js';
import { adminPermission, isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerSeoRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<SeoController>('seo.controller');
  const admin = isAdmin(container);

  app.get('/admin/seo/settings', { preHandler: [admin] }, controller.getGlobal.bind(controller));
  app.put('/admin/seo/settings', { preHandler: adminPermission(container, 'settings.manage') }, controller.updateGlobal.bind(controller));
  app.get('/admin/seo/products/:slug', { preHandler: [admin] }, controller.getProduct.bind(controller));
  app.put('/admin/seo/products/:slug', { preHandler: adminPermission(container, 'products.manage') }, controller.updateProduct.bind(controller));
}
