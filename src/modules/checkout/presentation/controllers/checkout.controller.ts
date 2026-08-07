import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CheckoutService } from '../../application/services/checkout.service.js';

export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  async checkout(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const body = request.body as {
      shippingMethod?: 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
      note?: string;
      paymentMethod?: 'CARD' | 'TRANSFER';
      couponCode?: string;
    };

    try {
      const result = await this.checkoutService.checkout({
        userId,
        shippingMethod: body.shippingMethod,
        note: body.note,
        paymentMethod: body.paymentMethod,
        couponCode: body.couponCode
      });
      return reply.status(201).send(result);
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async shippingOptions(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ options: this.checkoutService.getShippingOptions() });
  }
}
