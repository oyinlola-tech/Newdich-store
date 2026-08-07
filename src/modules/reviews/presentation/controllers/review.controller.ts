import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { ReviewService } from '../../application/services/review.service.js';

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  async listByProduct(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const query = request.query as { page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 20);
    const result = await this.reviewService.listByProduct(productId, page, limit);
    const average = await this.reviewService.getAverage(productId);
    return reply.send({ reviews: result.reviews, total: result.total, average, page, limit });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { productId } = request.params as { productId: string };
    const body = request.body as { rating?: number; title?: string; comment?: string };
    if (typeof body.rating !== 'number') {
      return reply.status(400).send({ message: 'rating is required.' });
    }
    try {
      const review = await this.reviewService.create(productId, userId, {
        rating: body.rating,
        title: body.title,
        comment: body.comment
      });
      return reply.status(201).send({ review });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { search?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.reviewService.listAll(page, limit, query.search?.trim());
    return reply.send({ reviews: result.reviews, total: result.total, page, limit });
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.reviewService.remove(id);
    return reply.send({ message: 'Review removed.' });
  }
}
