import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository.js';
import { PaymentService } from './application/services/payment.service.js';
import { PaymentSettingsService } from './application/services/payment-settings.service.js';
import { PaymentController } from './presentation/controllers/payment.controller.js';
import { PaymentSettingsController } from './presentation/controllers/payment-settings.controller.js';
import { registerPaymentRoutes } from './presentation/routes/payment.route.js';

export function registerPaymentsModule(container: Container, app: FastifyInstance): void {
  container.register('payment.repository', (c) => new PrismaPaymentRepository(c.get('prisma')));
  container.registerSingleton('payment-settings.service', (c) => new PaymentSettingsService(c.get('settings.repository')));
  container.register('payment.service', (c) =>
    new PaymentService(
      c.get('payment.repository'),
      c.get('order.service'),
      c.get('user.repository'),
      c.get('mailer.service'),
      c.get('payment-settings.service'),
      c.get('coupon.service')
    )
  );
  container.register('payment.controller', (c) => new PaymentController(c.get('payment.service')));
  container.register('payment-settings.controller', (c) => new PaymentSettingsController(c.get('payment-settings.service')));

  registerPaymentRoutes(app, container);
}
