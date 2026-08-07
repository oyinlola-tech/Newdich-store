import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ShippingController } from '../controllers/shipping.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerShippingRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ShippingController>('shipping.controller');
  const auth = authenticate(container);
  const admin = isAdmin(container);

  app.get('/orders/:orderId/shipment', { preHandler: [auth] }, controller.getByOrder.bind(controller));
  app.post('/admin/shipments', { preHandler: [admin] }, controller.create.bind(controller));
  app.put('/admin/shipments/:id/status', { preHandler: [admin] }, controller.updateStatus.bind(controller));
  app.put('/admin/shipments/:id/tracking', { preHandler: [admin] }, controller.updateTracking.bind(controller));
  app.get('/admin/shipments', { preHandler: [admin] }, controller.adminList.bind(controller));
}
