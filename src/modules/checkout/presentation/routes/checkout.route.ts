import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { CheckoutController } from '../controllers/checkout.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';

export function registerCheckoutRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<CheckoutController>('checkout.controller');
  const auth = authenticate(container);

  app.get('/checkout/shipping-options', controller.shippingOptions.bind(controller));
  app.post('/checkout', { preHandler: [auth] }, controller.checkout.bind(controller));
}
