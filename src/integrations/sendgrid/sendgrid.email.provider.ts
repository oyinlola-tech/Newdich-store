import type { EmailPort, SendEmailInput } from '../../core/application/ports/email.port.js';
import type { AppLogger } from '../../core/infrastructure/logger/logger.service.js';

interface SendGridResponse {
  id?: string;
  message?: string;
  errors?: { message: string }[];
}

export class SendGridEmailProvider implements EmailPort {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly logger: AppLogger
  ) {}

  async send(input: SendEmailInput): Promise<{ emailId?: string } | undefined> {
    const [fromName, fromEmail] = this.splitFrom();
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: input.to }] }],
        from: { email: fromEmail, name: fromName },
        subject: input.subject,
        content: [{ type: 'text/html', value: input.html }]
      })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as SendGridResponse;
      this.logger.error(
        { status: response.status, error: body.errors?.[0]?.message ?? body.message },
        'sendgrid email failed'
      );
      return;
    }
  }

  private splitFrom(): [string, string] {
    const match = /^(.*?)\s*<(.+?)>$/.exec(this.from);
    if (match) return [match[1].trim(), match[2].trim()];
    return [this.from, this.from];
  }
}
