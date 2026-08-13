import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { DiscountController } from '../controllers/discount.controller.js';
import { adminPermission } from '../../../auth/presentation/guards/admin.guard.js';

export function registerDiscountRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<DiscountController>('discount.controller');

  app.get('/discounts', controller.publicList.bind(controller));

  app.get('/admin/discounts', { preHandler: adminPermission(container, 'products.manage') }, controller.adminList.bind(controller));
  app.post('/admin/discounts', { preHandler: adminPermission(container, 'products.manage') }, controller.create.bind(controller));
  app.get('/admin/discounts/:id', { preHandler: adminPermission(container, 'products.manage') }, controller.adminGet.bind(controller));
  app.put('/admin/discounts/:id', { preHandler: adminPermission(container, 'products.manage') }, controller.update.bind(controller));
  app.delete('/admin/discounts/:id', { preHandler: adminPermission(container, 'products.manage') }, controller.remove.bind(controller));
}
