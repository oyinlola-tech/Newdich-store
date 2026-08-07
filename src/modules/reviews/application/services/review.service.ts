import type { ReviewRepositoryPort } from '../../infrastructure/repositories/prisma-review.repository.js';

export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepositoryPort) {}

  async create(productId: string, userId: string, input: { rating: number; title?: string; comment?: string }) {
    if (input.rating < 1 || input.rating > 5) {
      throw new Error('Rating must be between 1 and 5.');
    }
    const alreadyReviewed = await this.reviewRepository.hasReviewed(productId, userId);
    if (alreadyReviewed) {
      throw new Error('You have already reviewed this product.');
    }
    return this.reviewRepository.create({
      productId,
      userId,
      rating: input.rating,
      title: input.title,
      comment: input.comment
    });
  }

  listByProduct(productId: string, page: number, limit: number) {
    return this.reviewRepository.listByProduct(productId, page, limit);
  }

  listAll(page: number, limit: number, search?: string) {
    return this.reviewRepository.listAll(page, limit, search);
  }

  async remove(id: string): Promise<void> {
    await this.reviewRepository.remove(id);
  }

  getAverage(productId: string) {
    return this.reviewRepository.averageRating(productId);
  }
}
