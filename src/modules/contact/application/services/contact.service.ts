import type { ContactRepositoryPort } from '../../infrastructure/repositories/prisma-contact.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';

export class ContactService {
  constructor(
    private readonly contactRepository: ContactRepositoryPort,
    private readonly mailerService: MailerService
  ) {}

  create(input: { name: string; email: string; subject: string; message: string }) {
    if (!input.name.trim() || !input.email.trim() || !input.subject.trim() || !input.message.trim()) {
      throw new Error('name, email, subject and message are required.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error('A valid email is required.');
    }
    return this.contactRepository.create(input);
  }

  list(filters: { status?: string; search?: string }, page: number, limit: number) {
    return this.contactRepository.list(filters, page, limit);
  }

  getById(id: string) {
    return this.contactRepository.findById(id);
  }

  updateStatus(id: string, status: string) {
    const allowed = ['NEW', 'READ', 'REPLIED', 'CLOSED'];
    if (!allowed.includes(status)) {
      throw new Error(`status must be one of: ${allowed.join(', ')}.`);
    }
    return this.contactRepository.updateStatus(id, status as never);
  }

  async reply(id: string, reply: string) {
    if (!reply.trim()) {
      throw new Error('Reply text is required.');
    }
    const message = await this.contactRepository.reply(id, reply.trim());
    await this.mailerService.sendContactReply(
      { email: message.email, name: message.name },
      { subject: message.subject, reply: reply.trim() }
    );
    return message;
  }

  unreadCount() {
    return this.contactRepository.countUnread();
  }
}
