import type { EmailPort, SendEmailInput } from '../../core/application/ports/email.port.js';
import type { AppLogger } from '../../core/infrastructure/logger/logger.service.js';
import { SendByteClient } from './sendbyte.client.js';

export class SendByteEmailProvider implements EmailPort {
  private readonly client: SendByteClient;

  constructor(
    apiKey: string,
    private readonly from: string,
    private readonly logger: AppLogger,
    baseUrl?: string
  ) {
    this.client = new SendByteClient(apiKey, baseUrl);
  }

  async send(input: SendEmailInput): Promise<{ emailId?: string } | undefined> {
    try {
      const result = await this.client.send({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        tags: [input.purpose ?? 'transactional'],
        idempotency_key: input.idempotencyKey
      });
      return { emailId: result.id };
    } catch (error) {
      this.logger.error({ error }, 'sendbyte email failed');
      return undefined;
    }
  }
}
