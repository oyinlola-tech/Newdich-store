import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ProductVariantController } from '../controllers/product-variant.controller.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerProductVariantRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ProductVariantController>('product-variant.controller');
  const admin = isAdmin(container);

  app.get('/products/:productId/variants', controller.listByProduct.bind(controller));
  app.post('/admin/products/:productId/variants', { preHandler: [admin] }, controller.create.bind(controller));
  app.put('/admin/variants/:id', { preHandler: [admin] }, controller.update.bind(controller));
  app.delete('/admin/variants/:id', { preHandler: [admin] }, controller.delete.bind(controller));
}
