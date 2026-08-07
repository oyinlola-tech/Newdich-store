import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';

export class WebhookController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly sendByteWebhookSecret: string
  ) {}

  async sendByte(request: FastifyRequest, reply: FastifyReply) {
    const signature = request.headers['sendbyte-signature'] as string | undefined;
    if (!signature) {
      return reply.status(401).send({ message: 'Missing signature.' });
    }

    if (!this.verifySignature(signature, JSON.stringify(request.body))) {
      return reply.status(401).send({ message: 'Invalid signature.' });
    }

    const payload = request.body as {
      type?: string;
      created_at?: string;
      data?: { email_id?: string };
    };

    if (payload.type && payload.data?.email_id) {
      await this.mailerService.logExternalEvent({
        emailId: payload.data.email_id,
        status: payload.type,
        eventRaw: payload
      });
    }

    return reply.send({ received: true });
  }

  private verifySignature(header: string, payload: string): boolean {
    const match = header.match(/^t=(\d+),v1=([a-f0-9]+)$/);
    if (!match || !this.sendByteWebhookSecret) {
      return false;
    }
    const timestamp = match[1];
    const signature = match[2];

    const signedPayload = `${timestamp}.${payload}`;
    const expected = createHmac('sha256', this.sendByteWebhookSecret).update(signedPayload).digest('hex');

    const received = Buffer.from(signature, 'hex');
    const computed = Buffer.from(expected, 'hex');
    return received.length === computed.length && timingSafeEqual(received, computed);
  }
}
