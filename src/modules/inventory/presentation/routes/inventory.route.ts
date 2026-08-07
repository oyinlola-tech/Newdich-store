import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { InventoryController } from '../controllers/inventory.controller.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerInventoryRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<InventoryController>('inventory.controller');
  const admin = isAdmin(container);

  app.get('/admin/inventory', { preHandler: [admin] }, controller.list.bind(controller));
  app.get('/admin/inventory/variants/:variantId', { preHandler: [admin] }, controller.getByVariant.bind(controller));
  app.put('/admin/inventory/variants/:variantId', { preHandler: [admin] }, controller.adjust.bind(controller));
}
