import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { PaymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerPaymentRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<PaymentController>('payment.controller');
  const auth = authenticate(container);
  const admin = isAdmin(container);

  app.post('/payments/intent', { preHandler: [auth] }, controller.initiate.bind(controller));
  app.get('/payments/verify', { preHandler: [auth] }, controller.verify.bind(controller));
  app.post('/payments/webhook/paystack', controller.paystackWebhook.bind(controller));
  app.get('/payments/orders/:orderId', { preHandler: [auth] }, controller.listByOrder.bind(controller));

  app.get('/admin/payments', { preHandler: [admin] }, controller.adminList.bind(controller));
  app.post('/admin/payments/:paymentId/refund', { preHandler: [admin] }, controller.refund.bind(controller));
  app.put('/admin/payments/:paymentId/status', { preHandler: [admin] }, controller.updateStatus.bind(controller));
}
