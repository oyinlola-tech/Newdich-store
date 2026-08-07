import type { FastifyReply, FastifyRequest } from 'fastify';
import type { TaxService } from '../../application/services/tax.service.js';

export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  async getDefault(_request: FastifyRequest, reply: FastifyReply) {
    const rule = await this.taxService.getDefault();
    return reply.send({ taxRule: rule });
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const rules = await this.taxService.list();
    return reply.send({ taxRules: rules });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { country?: string; state?: string; rate?: number; isDefault?: boolean };
    if (!body.country || typeof body.rate !== 'number') {
      return reply.status(400).send({ message: 'country and rate are required.' });
    }
    try {
      const rule = await this.taxService.create({
        country: body.country,
        state: body.state,
        rate: body.rate,
        isDefault: body.isDefault
      });
      return reply.status(201).send({ taxRule: rule });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { country?: string; state?: string | null; rate?: number; isDefault?: boolean };
    const rule = await this.taxService.update(id, {
      country: body.country,
      state: body.state,
      rate: body.rate,
      isDefault: body.isDefault
    });
    return reply.send({ taxRule: rule });
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.taxService.remove(id);
    return reply.send({ message: 'Tax rule deleted.' });
  }
}
