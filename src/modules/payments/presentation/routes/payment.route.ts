import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { PaymentController } from '../controllers/payment.controller.js';
import type { PaymentSettingsController } from '../controllers/payment-settings.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';
import {
  adminPermission,
  isAdmin,
  isSuperAdmin
} from '../../../auth/presentation/guards/admin.guard.js';
import { registerRawBodyJsonParser } from '../../../../core/infrastructure/http/raw-body.js';

export function registerPaymentRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<PaymentController>('payment.controller');
  const settingsController = container.get<PaymentSettingsController>('payment-settings.controller');
  const auth = authenticate(container);
  const admin = isAdmin(container);
  const superAdmin = isSuperAdmin(container);

  app.post('/payments/intent', { preHandler: [auth], config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, controller.initiate.bind(controller));
  app.post('/payments/:paymentId/confirm', { preHandler: [auth], config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, controller.confirm.bind(controller));
  app.get('/payments/methods', { preHandler: [auth] }, controller.methods.bind(controller));
  app.get('/payments/verify', { preHandler: [auth], config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, controller.verify.bind(controller));
  app.get('/payments/orders/:orderId', { preHandler: [auth] }, controller.listByOrder.bind(controller));

  app.get('/admin/payments', { preHandler: [admin] }, controller.adminList.bind(controller));
  app.post(
    '/admin/payments/:paymentId/refund',
    { preHandler: adminPermission(container, 'payments.manage') },
    controller.refund.bind(controller)
  );
  app.put(
    '/admin/payments/:paymentId/status',
    { preHandler: adminPermission(container, 'payments.manage') },
    controller.updateStatus.bind(controller)
  );

  // Sensitive provider credentials (API keys, secrets) are superadmin-only.
  app.get('/admin/payments/settings', { preHandler: [superAdmin] }, settingsController.status.bind(settingsController));
  app.post('/admin/payments/settings/pin', { preHandler: [superAdmin] }, settingsController.createPin.bind(settingsController));
  app.put('/admin/payments/settings/pin', { preHandler: [superAdmin] }, settingsController.changePin.bind(settingsController));
  app.post('/admin/payments/settings/unlock', { preHandler: [superAdmin] }, settingsController.unlock.bind(settingsController));
  app.post('/admin/payments/settings/lock', { preHandler: [superAdmin] }, settingsController.lock.bind(settingsController));
  app.get('/admin/payments/settings/providers', { preHandler: [superAdmin] }, settingsController.providers.bind(settingsController));
  app.put('/admin/payments/settings/providers/:provider', { preHandler: [superAdmin] }, settingsController.saveProvider.bind(settingsController));
  app.patch('/admin/payments/settings/providers/:provider/toggle', { preHandler: [superAdmin] }, settingsController.toggleProvider.bind(settingsController));
  app.delete('/admin/payments/settings/providers/:provider', { preHandler: [superAdmin] }, settingsController.removeProvider.bind(settingsController));
  app.post('/admin/payments/settings/providers/:provider/reveal/:field', { preHandler: [superAdmin] }, settingsController.revealSecret.bind(settingsController));

  // Provider webhooks — raw body required for signature verification.
  app.register(
    (webhookApp, _opts, done) => {
      registerRawBodyJsonParser(webhookApp);
      webhookApp.post('/payments/webhook/:provider', controller.webhook.bind(controller));
      done();
    }
  );
}
