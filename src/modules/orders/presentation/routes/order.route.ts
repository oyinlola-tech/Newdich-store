import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { OrderController } from '../controllers/order.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerOrderRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<OrderController>('order.controller');
  const auth = authenticate(container);
  const admin = isAdmin(container);

  app.get('/orders', { preHandler: [auth] }, controller.listMine.bind(controller));
  app.get('/orders/:id', { preHandler: [auth] }, controller.getMine.bind(controller));
  app.get('/orders/track/:orderNumber', controller.track.bind(controller));

  app.get('/admin/orders', { preHandler: [admin] }, controller.adminList.bind(controller));
  app.get('/admin/orders/:id', { preHandler: [admin] }, controller.adminGet.bind(controller));
  app.put('/admin/orders/:id/status', { preHandler: [admin] }, controller.updateStatus.bind(controller));
}
