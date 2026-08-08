import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import { getRawBody } from '../../../../core/infrastructure/http/raw-body.js';
import type { PaymentService } from '../../application/services/payment.service.js';
import { PaymentSettingsError } from '../../application/services/payment-settings.service.js';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  async initiate(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.user!;
    const body = request.body as { orderId?: string; orderNumber?: string; amount?: number; method?: 'CARD' | 'TRANSFER' };

    if (!body.orderId || !body.orderNumber || typeof body.amount !== 'number') {
      return reply.status(400).send({ message: 'orderId, orderNumber and amount are required.' });
    }

    const intent = await this.paymentService.initiate({
      orderId: body.orderId,
      orderNumber: body.orderNumber,
      amount: body.amount,
      email,
      method: body.method
    });

    return reply.status(201).send({
      payment: {
        id: intent.paymentId,
        reference: intent.reference,
        status: intent.status,
        amount: intent.amount,
        method: intent.method,
        provider: intent.provider
      },
      inline: intent.inline ?? null,
      redirectUrl: intent.redirectUrl ?? null,
      transferAccount: intent.transferAccount ?? null
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
      if (error instanceof PaymentSettingsError) {
        return reply.status(503).send({ message: error.message });
      }
      return reply.status(404).send({ message: (error as Error).message });
    }
  }

  async webhook(request: FastifyRequest, reply: FastifyReply) {
    const { provider } = request.params as { provider: string };
    try {
      await this.paymentService.handleWebhook(provider, getRawBody(request), request.headers);
    } catch (error) {
      if (error instanceof PaymentSettingsError) {
        // Provider locked or not configured — ask the gateway to retry.
        return reply.status(503).send({ message: error.message });
      }
      return reply.status(401).send({ message: (error as Error).message });
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
    try {
      const payment = await this.paymentService.refund(paymentId);
      return reply.send({ message: 'Payment refunded.', paymentId: payment.id });
    } catch (error) {
      if (error instanceof PaymentSettingsError) {
        return reply.status(503).send({ message: error.message });
      }
      return reply.status(404).send({ message: (error as Error).message });
    }
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
