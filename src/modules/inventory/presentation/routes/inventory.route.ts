import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { InventoryController } from '../controllers/inventory.controller.js';
import { adminPermission, isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerInventoryRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<InventoryController>('inventory.controller');
  const admin = isAdmin(container);

  app.get('/inventory/:productId', controller.getByProduct.bind(controller));
  app.post('/inventory/check', controller.check.bind(controller));

  app.get('/admin/inventory', { preHandler: [admin] }, controller.list.bind(controller));
  app.get('/admin/inventory/variants/:variantId', { preHandler: [admin] }, controller.getByVariant.bind(controller));
  app.put('/admin/inventory/variants/:variantId', { preHandler: adminPermission(container, 'inventory.manage') }, controller.adjust.bind(controller));
  app.put('/admin/inventory/:productId', { preHandler: adminPermission(container, 'inventory.manage') }, controller.updateByProduct.bind(controller));
}
