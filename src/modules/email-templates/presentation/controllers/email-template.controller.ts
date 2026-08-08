import type { FastifyReply, FastifyRequest } from 'fastify';
import type { EmailTemplateService } from '../../application/services/email-template.service.js';

export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { category?: string };
    const templates = await this.emailTemplateService.list(query.category);
    return reply.send({ templates });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { name: string; subject: string; body: string; category: string };
    if (!body.name || !body.subject || !body.body) {
      return reply.status(400).send({ message: 'name, subject and body are required.' });
    }
    const template = await this.emailTemplateService.create(body);
    return reply.status(201).send({ template });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const template = await this.emailTemplateService.update(id, body);
    return reply.send({ template });
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.emailTemplateService.remove(id);
    return reply.send({ message: 'Template deleted.' });
  }
}
