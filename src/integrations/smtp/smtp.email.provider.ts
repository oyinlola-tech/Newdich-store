import nodemailer from 'nodemailer';
import type { EmailPort, SendEmailInput } from '../../core/application/ports/email.port.js';
import type { AppLogger } from '../../core/infrastructure/logger/logger.service.js';

export interface SmtpConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  secure?: boolean;
}

export class SmtpEmailProvider implements EmailPort {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    smtpConfig: SmtpConfig,
    private readonly from: string,
    private readonly logger: AppLogger
  ) {
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure ?? smtpConfig.port === 465,
      auth: smtpConfig.user
        ? { user: smtpConfig.user, pass: smtpConfig.pass ?? '' }
        : undefined
    });
  }

  async send(input: SendEmailInput): Promise<{ emailId?: string } | undefined> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text
      });
      return info.messageId ? { emailId: info.messageId } : undefined;
    } catch (error) {
      this.logger.error({ error }, 'smtp email failed');
      return;
    }
  }
}
