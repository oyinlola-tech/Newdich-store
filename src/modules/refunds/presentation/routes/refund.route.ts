import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { RefundController } from '../controllers/refund.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';
import { adminPermission } from '../../../auth/presentation/guards/admin.guard.js';

export function registerRefundRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<RefundController>('refund.controller');
  const auth = authenticate(container);

  app.get('/refunds', { preHandler: [auth] }, controller.listMine.bind(controller));

  app.post('/admin/returns/:id/refund', { preHandler: adminPermission(container, 'returns.manage') }, controller.approveRefund.bind(controller));
  app.get('/admin/refunds', { preHandler: adminPermission(container, 'returns.manage') }, controller.adminList.bind(controller));
  app.get('/admin/refunds/:id', { preHandler: adminPermission(container, 'returns.manage') }, controller.adminGet.bind(controller));
  app.patch('/admin/refunds/:id/status', { preHandler: adminPermission(container, 'returns.manage') }, controller.updateStatus.bind(controller));
}
