import { appConfig } from '../config/index.js';
import { ConsoleEmailProvider } from '../core/infrastructure/email/console-email.provider.js';
import type { EmailPort } from '../core/application/ports/email.port.js';
import { ResendEmailProvider } from './resend/resend.email.provider.js';
import { SendByteEmailProvider } from './sendbyte/sendbyte.email.provider.js';
import type { AppLogger } from '../core/infrastructure/logger/logger.service.js';

export function createEmailProvider(logger: AppLogger): EmailPort {
  if (appConfig.EMAIL_PROVIDER === 'resend' && appConfig.RESEND_API_KEY) {
    return new ResendEmailProvider(appConfig.RESEND_API_KEY, appConfig.EMAIL_FROM, logger);
  }
  if (appConfig.EMAIL_PROVIDER === 'sendbyte' && appConfig.SEND_BYTE_API_KEY) {
    return new SendByteEmailProvider(
      appConfig.SEND_BYTE_API_KEY,
      appConfig.EMAIL_FROM,
      logger,
      appConfig.SEND_BYTE_BASE_URL
    );
  }
  return new ConsoleEmailProvider(logger);
}
