import type { PrismaClient } from '@prisma/client';
import type { EmailPort } from '../../application/ports/email.port.js';
import type { AppLogger } from '../logger/logger.service.js';
import { appConfig } from '../../../config/index.js';
import {
  accountSuspendedEmail,
  adminAlertEmail,
  contactReplyEmail,
  loginAlertEmail,
  orderConfirmationEmail,
  orderStatusEmail,
  otpEmail,
  passwordChangedEmail,
  passwordResetEmail,
  paymentFailedEmail,
  paymentReceiptEmail,
  promotionalEmail,
  refundIssuedEmail,
  returnRequestedEmail,
  returnStatusEmail,
  shippingUpdateEmail,
  welcomeEmail
} from './templates/email-templates.js';

export interface MailUser {
  email: string;
  name: string;
}

export interface OrderMailData {
  userName: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  placedAt: Date;
  shippingAddress?: string;
}

export class MailerService {
  private adminEmailCache: { email: string; at: number } | null = null;

  constructor(
    private readonly emailPort: EmailPort,
    private readonly prisma: PrismaClient,
    private readonly logger: AppLogger
  ) {}

  private async resolveAdminEmail(): Promise<string> {
    // Admin email comes from StoreSettings (key 'notifications.adminEmail'),
    // falling back to the ADMIN_EMAIL environment variable.
    if (this.adminEmailCache && Date.now() - this.adminEmailCache.at < 5 * 60 * 1000) {
      return this.adminEmailCache.email;
    }
    let email = appConfig.ADMIN_EMAIL;
    try {
      const entry = await this.prisma.storeSettings.findUnique({ where: { key: 'notifications.adminEmail' } });
      const stored = typeof entry?.value === 'string' ? entry.value : null;
      if (stored && /^\S+@\S+\.\S+$/.test(stored)) {
        email = stored;
      }
    } catch (error) {
      this.logger.error({ error }, 'failed to read admin email from settings');
    }
    this.adminEmailCache = { email, at: Date.now() };
    return email;
  }

  private async dispatch(input: {
    to: string;
    subject: string;
    html: string;
    purpose: string;
    text?: string;
    idempotencyKey?: string;
  }): Promise<void> {
    let emailId: string | undefined;
    let failed = false;
    try {
      const result = await this.emailPort.send(input);
      emailId = result?.emailId;
    } catch (error) {
      failed = true;
      this.logger.error({ error, to: input.to, purpose: input.purpose }, 'email dispatch failed');
    }

    await this.prisma.emailLog
      .create({
        data: {
          to: input.to,
          subject: input.subject,
          purpose: input.purpose,
          provider: appConfig.EMAIL_PROVIDER,
          emailId: emailId ?? null,
          status: failed ? 'FAILED' : emailId ? 'QUEUED' : 'SENT'
        }
      })
      .catch((error) => this.logger.error({ error }, 'failed to write email log'));
  }

  sendWelcome(user: MailUser): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: 'Welcome to Telente Store',
      html: welcomeEmail(user.name),
      purpose: 'welcome'
    });
  }

  sendOtp(user: MailUser, code: string, minutes: number, purpose: string): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: purpose === 'login' ? 'Your login verification code' : 'Your verification code',
      html: otpEmail(user.name, code, minutes, purpose),
      purpose: `otp:${purpose}`
    });
  }

  sendLoginAlert(user: MailUser, input: { ip: string; userAgent: string; location: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: 'New sign-in detected on your account',
      html: loginAlertEmail(user.name, input.ip, input.userAgent, input.location),
      purpose: 'login-alert'
    });
  }

  sendPasswordChanged(user: MailUser): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: 'Your password has been changed',
      html: passwordChangedEmail(user.name),
      purpose: 'password-changed'
    });
  }

  sendPasswordReset(user: MailUser, resetUrl: string): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: 'Reset your Telente Store password',
      html: passwordResetEmail(user.name, resetUrl),
      purpose: 'password-reset'
    });
  }

  sendOrderConfirmation(user: MailUser, order: OrderMailData): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Order confirmed — #${order.orderNumber}`,
      html: orderConfirmationEmail(order),
      purpose: 'order-confirmation'
    });
  }

  sendPaymentReceipt(user: MailUser, input: { orderNumber: string; amount: number; method: string; reference: string; paidAt: Date }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Payment received — ${input.orderNumber}`,
      html: paymentReceiptEmail({ userName: user.name, ...input }),
      purpose: 'payment-receipt'
    });
  }

  sendPaymentFailed(user: MailUser, input: { orderNumber: string; amount: number; reference: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Payment failed — ${input.orderNumber}`,
      html: paymentFailedEmail({ userName: user.name, ...input }),
      purpose: 'payment-failed'
    });
  }

  sendOrderStatusUpdate(user: MailUser, input: { orderNumber: string; status: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Order update — ${input.orderNumber}`,
      html: orderStatusEmail({ userName: user.name, ...input }),
      purpose: 'order-status'
    });
  }

  sendShippingUpdate(user: MailUser, input: { orderNumber: string; status: string; carrier: string; trackingNumber: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Shipping update — ${input.orderNumber}`,
      html: shippingUpdateEmail({ userName: user.name, ...input }),
      purpose: 'shipping-update'
    });
  }

  sendReturnRequested(user: MailUser, input: { orderNumber: string; reason: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Return request received — ${input.orderNumber}`,
      html: returnRequestedEmail({ userName: user.name, ...input }),
      purpose: 'return-requested'
    });
  }

  sendReturnStatusUpdate(user: MailUser, input: { orderNumber: string; status: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Return update — ${input.orderNumber}`,
      html: returnStatusEmail({ userName: user.name, ...input }),
      purpose: 'return-status'
    });
  }

  sendRefundIssued(user: MailUser, input: { orderNumber: string; amount: number; method: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Refund issued — ${input.orderNumber}`,
      html: refundIssuedEmail({ userName: user.name, ...input }),
      purpose: 'refund-issued'
    });
  }

  sendAccountSuspended(user: MailUser, reason: string): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: 'Your account has been suspended',
      html: accountSuspendedEmail(user.name, reason),
      purpose: 'account-suspended'
    });
  }

  sendPromotion(user: MailUser, input: { title: string; body: string; ctaUrl?: string; ctaLabel?: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: input.title,
      html: promotionalEmail(user.name, input.title, input.body, input.ctaUrl, input.ctaLabel),
      purpose: 'promotion'
    });
  }

  async sendAdminAlert(input: { subject: string; body: string; ctaUrl?: string; ctaLabel?: string }): Promise<void> {
    return this.dispatch({
      to: await this.resolveAdminEmail(),
      subject: input.subject,
      html: adminAlertEmail(input.subject, input.body, input.ctaUrl, input.ctaLabel),
      purpose: 'admin-alert'
    });
  }

  sendContactReply(user: MailUser, input: { subject: string; reply: string }): Promise<void> {
    return this.dispatch({
      to: user.email,
      subject: `Re: ${input.subject}`,
      html: contactReplyEmail(user.name, input.subject, input.reply),
      purpose: 'contact-reply'
    });
  }

  async logExternalEvent(input: { emailId: string; status: string; eventRaw: unknown }): Promise<void> {
    const statusMap: Record<string, string> = {
      'email.sent': 'SENT',
      'email.delivered': 'DELIVERED',
      'email.opened': 'OPENED',
      'email.clicked': 'CLICKED',
      'email.bounced': 'BOUNCED',
      'email.complained': 'COMPLAINED',
      'email.unsubscribed': 'UNSUBSCRIBED'
    };
    const status = statusMap[input.status];
    if (!status) return;
    await this.prisma.emailLog
      .updateMany({
        where: { emailId: input.emailId },
        data: { status: status as never, eventRaw: input.eventRaw as never }
      })
      .catch((error) => this.logger.error({ error }, 'failed to update email log from webhook'));
  }
}
