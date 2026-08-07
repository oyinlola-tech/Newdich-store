import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ProductController } from '../controllers/product.controller.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerProductRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ProductController>('product.controller');
  const admin = isAdmin(container);

  app.get('/products', controller.list.bind(controller));
  app.get('/products/search', controller.search.bind(controller));
  app.get('/products/:idOrSlug', controller.get.bind(controller));

  app.get('/admin/products', { preHandler: [admin] }, controller.adminList.bind(controller));
  app.get('/admin/products/:id', { preHandler: [admin] }, controller.adminGet.bind(controller));
  app.post('/admin/products', { preHandler: [admin] }, controller.create.bind(controller));
  app.put('/admin/products/:id', { preHandler: [admin] }, controller.update.bind(controller));
  app.delete('/admin/products/:id', { preHandler: [admin] }, controller.delete.bind(controller));
}
