import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ReviewPromptService } from '../../application/services/review-prompt.service.js';

export class ReviewPromptController {
  constructor(private readonly reviewPromptService: ReviewPromptService) {}

  async pending(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const prompts = await this.reviewPromptService.pendingForUser(userId);
    return reply.send({ prompts: prompts.map((p) => ({ id: p.id, productId: p.productId, orderId: p.orderId, expiresAt: p.expiresAt })) });
  }
}
