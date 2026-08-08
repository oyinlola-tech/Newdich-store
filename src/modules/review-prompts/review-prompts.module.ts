import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaReviewPromptRepository } from './infrastructure/repositories/prisma-review-prompt.repository.js';
import { ReviewPromptService } from './application/services/review-prompt.service.js';
import { ReviewPromptController } from './presentation/controllers/review-prompt.controller.js';
import { registerReviewPromptRoutes } from './presentation/routes/review-prompt.route.js';

export function registerReviewPromptsModule(container: Container, app: FastifyInstance): void {
  container.register('review-prompt.repository', (c) => new PrismaReviewPromptRepository(c.get('prisma')));
  container.register('review-prompt.service', (c) =>
    new ReviewPromptService(c.get('review-prompt.repository'))
  );
  container.register('review-prompt.controller', (c) =>
    new ReviewPromptController(c.get('review-prompt.service'))
  );

  registerReviewPromptRoutes(app, container);
}
