import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { ContactService } from '../../application/services/contact.service.js';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { name?: string; email?: string; subject?: string; message?: string };
    if (!body.name || !body.email || !body.message) {
      return reply.status(400).send({ message: 'name, email and message are required.' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
      return reply.status(400).send({ message: 'A valid email address is required.' });
    }
    try {
      const message = await this.contactService.create({
        name: body.name ?? '',
        email: body.email ?? '',
        subject: body.subject ?? '',
        message: body.message ?? ''
      });
      return reply.status(201).send({ message: 'Message sent successfully.', id: message.id });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async subscribe(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { email?: string };
    const email = body.email?.trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return reply.status(400).send({ message: 'A valid email address is required.' });
    }
    try {
      await this.contactService.create({
        name: 'Newsletter Subscriber',
        email,
        subject: 'Newsletter Subscription',
        message: 'Subscribe to newsletter'
      });
      return reply.send({ message: 'Subscribed successfully!' });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { status?: string; search?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.contactService.list(
      { status: query.status, search: query.search?.trim() },
      page,
      limit
    );
    const unread = await this.contactService.unreadCount();
    return reply.send({ messages: result.messages, total: result.total, unread, page, limit });
  }

  async adminGet(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const message = await this.contactService.getById(id);
    if (!message) {
      return reply.status(404).send({ message: 'Message not found.' });
    }
    return reply.send({ message });
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string };
    if (!body.status) {
      return reply.status(400).send({ message: 'status is required.' });
    }
    try {
      const message = await this.contactService.updateStatus(id, body.status);
      return reply.send({ message });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async reply(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { reply?: string };
    if (!body.reply || body.reply.trim().length === 0) {
      return reply.status(400).send({ message: 'reply is required.' });
    }
    try {
      const message = await this.contactService.reply(id, body.reply ?? '');
      return reply.send({ message });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }
}
