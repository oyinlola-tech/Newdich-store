import type { EmailPort, SendEmailInput } from '../../application/ports/email.port.js';
import type { AppLogger } from '../logger/logger.service.js';

export class ConsoleEmailProvider implements EmailPort {
  constructor(private readonly logger: AppLogger) {}

  async send(input: SendEmailInput): Promise<{ emailId?: string } | undefined> {
    this.logger.info(
      {
        to: input.to,
        subject: input.subject,
        html: input.html
      },
      'email sent (console provider)'
    );
    return undefined;
  }
}
