import { randomBytes } from 'node:crypto';
import type { NewsletterRepositoryPort } from '../../infrastructure/repositories/prisma-newsletter.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import type { AppLogger } from '../../../../core/infrastructure/logger/logger.service.js';

export class NewsletterService {
  constructor(
    private readonly newsletterRepository: NewsletterRepositoryPort,
    private readonly mailerService: MailerService,
    private readonly logger: AppLogger
  ) {}

  async subscribe(input: { email: string; name?: string; source: string }): Promise<{ subscriber: unknown; newlySubscribed: boolean }> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.newsletterRepository.findByEmail(email);
    if (existing) {
      if (existing.status === 'UNSUBSCRIBED') {
        const subscriber = await this.newsletterRepository.updateStatus(existing.id, 'SUBSCRIBED');
        await this.sendWelcome(email, subscriber.name ?? input.name ?? 'there');
        return { subscriber, newlySubscribed: true };
      }
      return { subscriber: existing, newlySubscribed: false };
    }

    const subscriber = await this.newsletterRepository.create({
      email,
      name: input.name?.trim() || undefined,
      token: randomBytes(24).toString('hex'),
      source: input.source
    });
    await this.sendWelcome(email, subscriber.name ?? 'there');
    return { subscriber, newlySubscribed: true };
  }

  async unsubscribeByToken(token: string): Promise<{ unsubscribed: boolean; alreadyUnsubscribed: boolean }> {
    const subscriber = await this.newsletterRepository.findByToken(token);
    if (!subscriber) {
      throw new Error('Invalid unsubscribe link.');
    }
    if (subscriber.status === 'UNSUBSCRIBED') {
      return { unsubscribed: false, alreadyUnsubscribed: true };
    }
    const updated = await this.newsletterRepository.updateStatus(subscriber.id, 'UNSUBSCRIBED');
    await this.sendUnsubscribed(updated.email, updated.name ?? 'there');
    return { unsubscribed: true, alreadyUnsubscribed: false };
  }

  list(filters: { status?: string; search?: string }, page: number, limit: number) {
    return this.newsletterRepository.list(filters, page, limit);
  }

  counts() {
    return this.newsletterRepository.counts();
  }

  private async sendWelcome(email: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendNewsletterWelcome({ email, name });
    } catch (error) {
      this.logger.error({ error, email }, 'newsletter welcome email failed');
    }
  }

  private async sendUnsubscribed(email: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendNewsletterUnsubscribe({ email, name });
    } catch (error) {
      this.logger.error({ error, email }, 'newsletter unsubscribe email failed');
    }
  }
}
