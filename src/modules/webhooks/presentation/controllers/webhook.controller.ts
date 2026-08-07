import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import { getRawBody } from '../../../../core/infrastructure/http/raw-body.js';

const MAX_SIGNATURE_AGE_SECONDS = 300;

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

    const verification = this.verifySignature(signature, getRawBody(request));
    if (!verification.valid) {
      return reply.status(401).send({ message: verification.reason ?? 'Invalid signature.' });
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

  private verifySignature(header: string, payload: string): { valid: boolean; reason?: string } {
    const match = header.match(/^t=(\d+),v1=([a-f0-9]+)$/);
    if (!match || !this.sendByteWebhookSecret) {
      return { valid: false, reason: 'Malformed signature.' };
    }

    const timestamp = Number(match[1]);
    if (!Number.isFinite(timestamp)) {
      return { valid: false, reason: 'Malformed timestamp.' };
    }

    const ageSeconds = Math.abs(Date.now() / 1000 - timestamp);
    if (ageSeconds > MAX_SIGNATURE_AGE_SECONDS) {
      return { valid: false, reason: 'Signature has expired.' };
    }

    const signedPayload = `${match[1]}.${payload}`;
    const expected = createHmac('sha256', this.sendByteWebhookSecret).update(signedPayload).digest('hex');

    const received = Buffer.from(match[2], 'hex');
    const computed = Buffer.from(expected, 'hex');
    const valid = received.length === computed.length && timingSafeEqual(received, computed);
    return valid ? { valid: true } : { valid: false, reason: 'Signature mismatch.' };
  }
}
