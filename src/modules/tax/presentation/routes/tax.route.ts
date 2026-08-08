import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { TaxController } from '../controllers/tax.controller.js';
import { adminPermission, isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerTaxRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<TaxController>('tax.controller');
  const admin = isAdmin(container);

  app.get('/tax-rules/default', controller.getDefault.bind(controller));
  app.get('/admin/tax-rules', { preHandler: [admin] }, controller.list.bind(controller));
  app.post('/admin/tax-rules', { preHandler: adminPermission(container, 'settings.manage') }, controller.create.bind(controller));
  app.put('/admin/tax-rules/:id', { preHandler: adminPermission(container, 'settings.manage') }, controller.update.bind(controller));
  app.delete('/admin/tax-rules/:id', { preHandler: adminPermission(container, 'settings.manage') }, controller.remove.bind(controller));
}
