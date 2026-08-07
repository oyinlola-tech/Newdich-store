import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository.js';
import { PaymentService } from './application/services/payment.service.js';
import { PaymentController } from './presentation/controllers/payment.controller.js';
import { registerPaymentRoutes } from './presentation/routes/payment.route.js';
import { paymentConfig } from '../../config/index.js';

export function registerPaymentsModule(container: Container, app: FastifyInstance): void {
  container.register('payment.repository', (c) => new PrismaPaymentRepository(c.get('prisma')));
  container.register('payment.service', (c) =>
    new PaymentService(
      c.get('payment.repository'),
      c.get('order.service'),
      c.get('user.repository'),
      c.get('mailer.service'),
      paymentConfig.PAYSTACK_SECRET_KEY ?? ''
    )
  );
  container.register('payment.controller', (c) =>
    new PaymentController(c.get('payment.service'), paymentConfig.PAYSTACK_SECRET_KEY ?? '')
  );

  registerPaymentRoutes(app, container);
}
