import type { FastifyReply, FastifyRequest } from 'fastify';
import type { BrandService } from '../../application/services/brand.service.js';
import { parseBody } from '../../../../core/infrastructure/http/parse.js';
import { brandValidator, brandUpdateValidator } from '../validators/brand.validator.js';

export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  async listPublic(_request: FastifyRequest, reply: FastifyReply) {
    const brands = await this.brandService.listPublic();
    return reply.send({ brands });
  }

  async listAdmin(_request: FastifyRequest, reply: FastifyReply) {
    const brands = await this.brandService.listAdmin();
    return reply.send({ brands });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const brand = await this.brandService.getByIdOrSlug(id);
    return reply.send({ brand });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(brandValidator, request.body);
    const brand = await this.brandService.create(dto);
    return reply.status(201).send({ brand });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const dto = parseBody(brandUpdateValidator, request.body);
    const brand = await this.brandService.update(id, dto);
    return reply.send({ brand });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.brandService.delete(id);
    return reply.send({ message: 'Brand deleted.' });
  }
}
