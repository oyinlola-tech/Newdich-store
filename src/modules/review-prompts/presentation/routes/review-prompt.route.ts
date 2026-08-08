import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ReviewPromptController } from '../controllers/review-prompt.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';

export function registerReviewPromptRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ReviewPromptController>('review-prompt.controller');
  const auth = authenticate(container);

  app.get('/review-prompts/pending', { preHandler: [auth] }, controller.pending.bind(controller));
}
