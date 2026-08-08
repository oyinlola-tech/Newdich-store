import type { EmailPort, SendEmailInput } from '../../core/application/ports/email.port.js';
import type { AppLogger } from '../../core/infrastructure/logger/logger.service.js';

interface MailgunResponse {
  id?: string;
  message?: string;
}

export class MailgunEmailProvider implements EmailPort {
  constructor(
    private readonly apiKey: string,
    private readonly domain: string,
    private readonly from: string,
    private readonly logger: AppLogger,
    private readonly baseUrl = 'https://api.mailgun.net/v3'
  ) {}

  async send(input: SendEmailInput): Promise<{ emailId?: string } | undefined> {
    const form = new URLSearchParams({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? ''
    });

    const response = await fetch(`${this.baseUrl}/${this.domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as MailgunResponse;
      this.logger.error({ status: response.status, error: body.message }, 'mailgun email failed');
      return;
    }

    const body = (await response.json().catch(() => ({}))) as MailgunResponse;
    return body.id ? { emailId: body.id } : undefined;
  }
}
