import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { NewsletterService } from '../../application/services/newsletter.service.js';

export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  async subscribe(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { email?: string; name?: string; source?: string };
    const email = body.email?.trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return reply.status(400).send({ message: 'A valid email address is required.' });
    }
    try {
      const result = await this.newsletterService.subscribe({
        email,
        name: body.name,
        source: (body.source ?? 'FOOTER').toUpperCase().slice(0, 20)
      });
      return reply.status(result.newlySubscribed ? 201 : 200).send({
        message: result.newlySubscribed ? 'Subscribed successfully!' : 'You are already subscribed.',
        alreadySubscribed: !result.newlySubscribed
      });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async unsubscribe(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { token?: string };
    if (!body.token) {
      return reply.status(400).send({ message: 'token is required.' });
    }
    try {
      const result = await this.newsletterService.unsubscribeByToken(body.token);
      return reply.send({
        message: result.unsubscribed
          ? 'You have been unsubscribed.'
          : 'You were already unsubscribed.',
        alreadyUnsubscribed: result.alreadyUnsubscribed
      });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { status?: string; search?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.newsletterService.list(
      { status: query.status, search: query.search?.trim() },
      page,
      limit
    );
    const counts = await this.newsletterService.counts();
    return reply.send({
      subscribers: result.subscribers,
      total: result.total,
      counts,
      page,
      limit
    });
  }

  async adminCounts(_request: FastifyRequest, reply: FastifyReply) {
    const counts = await this.newsletterService.counts();
    return reply.send({ counts });
  }
}
