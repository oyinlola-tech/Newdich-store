import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AddressService } from '../../application/services/address.service.js';

export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const addresses = await this.addressService.listByUser(userId);
    return reply.send({ addresses });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const body = request.body as Record<string, unknown>;
    if (!body.firstName || !body.phone || !body.line1 || !body.city || !body.state) {
      return reply.status(400).send({
        message: 'firstName, phone, line1, city and state are required.'
      });
    }
    const address = await this.addressService.create(userId, {
      label: body.label as string | undefined,
      firstName: body.firstName as string,
      lastName: body.lastName as string | undefined,
      phone: body.phone as string,
      line1: body.line1 as string,
      line2: body.line2 as string | undefined,
      city: body.city as string,
      state: body.state as string,
      country: (body.country as string | undefined) ?? 'NG',
      postalCode: body.postalCode as string | undefined,
      isDefault: body.isDefault as boolean | undefined
    });
    return reply.status(201).send({ address });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const existing = await this.addressService.getById(id);
    if (!existing || existing.userId !== userId) {
      return reply.status(404).send({ message: 'Address not found.' });
    }

    const address = await this.addressService.update(id, {
      label: body.label as string | undefined,
      firstName: body.firstName as string | undefined,
      lastName: body.lastName as string | undefined,
      phone: body.phone as string | undefined,
      line1: body.line1 as string | undefined,
      line2: body.line2 as string | undefined,
      city: body.city as string | undefined,
      state: body.state as string | undefined,
      country: body.country as string | undefined,
      postalCode: body.postalCode as string | undefined,
      isDefault: body.isDefault as boolean | undefined
    });
    return reply.send({ address });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    try {
      await this.addressService.remove(userId, id);
      return reply.send({ message: 'Address deleted successfully.' });
    } catch {
      return reply.status(404).send({ message: 'Address not found.' });
    }
  }
}
