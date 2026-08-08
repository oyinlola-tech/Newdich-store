import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { CheckoutRepository } from './infrastructure/checkout.repository.js';
import { CheckoutService } from './application/services/checkout.service.js';
import { CheckoutController } from './presentation/controllers/checkout.controller.js';
import { registerCheckoutRoutes } from './presentation/routes/checkout.route.js';

export function registerCheckoutModule(container: Container, app: FastifyInstance): void {
  container.register('checkout.repository', (c) => new CheckoutRepository(c.get('prisma')));
  container.register('checkout.service', (c) =>
    new CheckoutService(
      c.get('checkout.repository'),
      c.get('cart.repository'),
      c.get('order.service'),
      c.get('payment.service'),
      c.get('user.repository'),
      c.get('tax.service'),
      c.get('coupon.service'),
      c.has('review-prompt.service') ? c.get('review-prompt.service') : undefined
    )
  );
  container.register('checkout.controller', (c) => new CheckoutController(c.get('checkout.service')));

  registerCheckoutRoutes(app, container);
}
