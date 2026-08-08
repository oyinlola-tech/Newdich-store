import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ProductVariantController } from '../controllers/product-variant.controller.js';
import { adminPermission } from '../../../auth/presentation/guards/admin.guard.js';

export function registerProductVariantRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ProductVariantController>('product-variant.controller');
  
  app.get('/products/:productId/variants', controller.listByProduct.bind(controller));
  app.post(
    '/admin/products/:productId/variants',
    { preHandler: adminPermission(container, 'products.manage') },
    controller.create.bind(controller)
  );
  app.put(
    '/admin/variants/:id',
    { preHandler: adminPermission(container, 'products.manage') },
    controller.update.bind(controller)
  );
  app.delete(
    '/admin/variants/:id',
    { preHandler: adminPermission(container, 'products.manage') },
    controller.delete.bind(controller)
  );
}
