import type { FastifyReply, FastifyRequest } from 'fastify';

export class EmailController {
  constructor() {}

  async send(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { to: string; subject: string; body: string; templateId?: string };
    if (!body.to || !body.subject || !body.body) {
      return reply.status(400).send({ message: 'to, subject and body are required.' });
    }

    return reply.send({ message: 'Email queued successfully.' });
  }
}
