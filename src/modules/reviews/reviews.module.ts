import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaReviewRepository } from './infrastructure/repositories/prisma-review.repository.js';
import { ReviewService } from './application/services/review.service.js';
import { ReviewController } from './presentation/controllers/review.controller.js';
import { registerReviewRoutes } from './presentation/routes/review.route.js';

export function registerReviewsModule(container: Container, app: FastifyInstance): void {
  container.register('review.repository', (c) => new PrismaReviewRepository(c.get('prisma')));
  container.register('review.service', (c) => new ReviewService(c.get('review.repository')));
  container.register('review.controller', (c) => new ReviewController(c.get('review.service')));

  registerReviewRoutes(app, container);
}
