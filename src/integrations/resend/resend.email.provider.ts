import type { EmailPort, SendEmailInput } from '../../core/application/ports/email.port.js';
import type { AppLogger } from '../../core/infrastructure/logger/logger.service.js';

interface ResendErrorResponse {
  message?: string;
}

export class ResendEmailProvider implements EmailPort {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly logger: AppLogger
  ) {}

  async send(input: SendEmailInput): Promise<{ emailId?: string } | undefined> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text
      })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as ResendErrorResponse;
      this.logger.error({ status: response.status, error: body.message }, 'resend email failed');
      return;
    }
  }
}
