import type { FastifyReply, FastifyRequest } from 'fastify';
import type { SeoService } from '../../application/services/seo.service.js';

export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  async getGlobal(_request: FastifyRequest, reply: FastifyReply) {
    const seo = await this.seoService.getGlobalSeo();
    return reply.send({ seo });
  }

  async updateGlobal(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as Record<string, unknown>;
    const seo = await this.seoService.updateGlobalSeo(body);
    return reply.send({ seo });
  }

  async getProduct(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const seo = await this.seoService.getProductSeo(slug);
    if (!seo) {
      return reply.status(404).send({ message: 'Product not found.' });
    }
    return reply.send({ seo });
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const body = request.body as Record<string, unknown>;
    const seo = await this.seoService.updateProductSeo(slug, body);
    return reply.send({ seo });
  }
}
