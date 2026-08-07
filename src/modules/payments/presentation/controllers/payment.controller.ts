import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import { getRawBody } from '../../../../core/infrastructure/http/raw-body.js';
import type { PaymentService } from '../../application/services/payment.service.js';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService, private readonly paystackSecret: string) {}

  async initiate(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.user!;
    const body = request.body as { orderId?: string; orderNumber?: string; amount?: number; method?: 'CARD' | 'TRANSFER' };

    if (!body.orderId || !body.orderNumber || typeof body.amount !== 'number') {
      return reply.status(400).send({ message: 'orderId, orderNumber and amount are required.' });
    }

    const result = await this.paymentService.initiate({
      orderId: body.orderId,
      orderNumber: body.orderNumber,
      amount: body.amount,
      email,
      method: body.method
    });

    return reply.status(201).send({
      payment: {
        id: result.payment.id,
        reference: result.payment.reference,
        status: result.payment.status,
        amount: result.payment.amount,
        method: result.payment.method
      },
      authorizationUrl: result.authorizationUrl
    });
  }

  async confirm(request: FastifyRequest, reply: FastifyReply) {
    const { paymentId } = request.params as { paymentId: string };
    try {
      const result = await this.paymentService.confirm(paymentId);
      return reply.send(result);
    } catch (error) {
      return reply.status(404).send({ message: (error as Error).message });
    }
  }

  async methods(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ methods: this.paymentService.paymentMethods() });
  }

  async verify(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { reference?: string };
    if (!query.reference) {
      return reply.status(400).send({ message: 'reference is required.' });
    }
    try {
      const payment = await this.paymentService.verify(query.reference);
      return reply.send({ payment });
    } catch (error) {
      return reply.status(404).send({ message: (error as Error).message });
    }
  }

  async paystackWebhook(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      event?: string;
      data?: { reference?: string };
    };
    const signature = request.headers['x-paystack-signature'] as string | undefined;

    const payload = getRawBody(request);
    const expected = createHmac('sha512', this.paystackSecret).update(payload).digest('hex');
    const signatureBytes = Buffer.from(signature ?? '', 'utf8');
    const expectedBytes = Buffer.from(expected, 'utf8');

    if (!signature || signatureBytes.length !== expectedBytes.length || !timingSafeEqual(signatureBytes, expectedBytes)) {
      return reply.status(401).send({ message: 'Invalid signature.' });
    }

    if (body.event === 'charge.success' && body.data?.reference) {
      await this.paymentService.verifyWebhook(body.data.reference);
    }

    return reply.send({ received: true });
  }

  async listByOrder(request: FastifyRequest, reply: FastifyReply) {
    const { orderId } = request.params as { orderId: string };
    const payments = await this.paymentService.listByOrder(orderId);
    return reply.send({ payments });
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.paymentService.list(page, limit);
    return reply.send({ payments: result.payments, total: result.total, page, limit });
  }

  async refund(request: FastifyRequest, reply: FastifyReply) {
    const { paymentId } = request.params as { paymentId: string };
    const payment = await this.paymentService.getById(paymentId);
    if (!payment) {
      return reply.status(404).send({ message: 'Payment not found.' });
    }
    await this.paymentService.refund(payment.id);
    return reply.send({ message: 'Payment refunded.', paymentId });
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { paymentId } = request.params as { paymentId: string };
    const body = request.body as { status?: string };
    const allowed = ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'];
    if (!body.status || !allowed.includes(body.status)) {
      return reply.status(400).send({ message: `status must be one of: ${allowed.join(', ')}.` });
    }
    const payment = await this.paymentService.updateStatus(paymentId, body.status as never);
    return reply.send({ payment });
  }
}
