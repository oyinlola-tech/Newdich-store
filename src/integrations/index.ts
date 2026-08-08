import { appConfig } from '../config/index.js';
import { ConsoleEmailProvider } from '../core/infrastructure/email/console-email.provider.js';
import type { EmailPort } from '../core/application/ports/email.port.js';
import { ResendEmailProvider } from './resend/resend.email.provider.js';
import { SendByteEmailProvider } from './sendbyte/sendbyte.email.provider.js';
import { SmtpEmailProvider } from './smtp/smtp.email.provider.js';
import { SendGridEmailProvider } from './sendgrid/sendgrid.email.provider.js';
import { MailgunEmailProvider } from './mailgun/mailgun.email.provider.js';
import type { AppLogger } from '../core/infrastructure/logger/logger.service.js';

export function createEmailProvider(logger: AppLogger): EmailPort {
  switch (appConfig.EMAIL_PROVIDER) {
    case 'resend':
      if (appConfig.RESEND_API_KEY) {
        return new ResendEmailProvider(appConfig.RESEND_API_KEY, appConfig.EMAIL_FROM, logger);
      }
      break;
    case 'sendbyte':
      if (appConfig.SEND_BYTE_API_KEY) {
        return new SendByteEmailProvider(
          appConfig.SEND_BYTE_API_KEY,
          appConfig.EMAIL_FROM,
          logger,
          appConfig.SEND_BYTE_BASE_URL
        );
      }
      break;
    case 'smtp':
      if (appConfig.SMTP_HOST) {
        return new SmtpEmailProvider(
          {
            host: appConfig.SMTP_HOST,
            port: appConfig.SMTP_PORT,
            user: appConfig.SMTP_USER,
            pass: appConfig.SMTP_PASS,
            secure: appConfig.SMTP_SECURE === 'true'
          },
          appConfig.EMAIL_FROM,
          logger
        );
      }
      break;
    case 'sendgrid':
      if (appConfig.SENDGRID_API_KEY) {
        return new SendGridEmailProvider(appConfig.SENDGRID_API_KEY, appConfig.EMAIL_FROM, logger);
      }
      break;
    case 'mailgun':
      if (appConfig.MAILGUN_API_KEY && appConfig.MAILGUN_DOMAIN) {
        return new MailgunEmailProvider(
          appConfig.MAILGUN_API_KEY,
          appConfig.MAILGUN_DOMAIN,
          appConfig.EMAIL_FROM,
          logger,
          appConfig.MAILGUN_BASE_URL
        );
      }
      break;
    default:
      break;
  }
  return new ConsoleEmailProvider(logger);
}
