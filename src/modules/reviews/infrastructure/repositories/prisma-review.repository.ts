import type { PrismaClient } from '@prisma/client';
import type { Review } from '@prisma/client';

export interface CreateReviewInput {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase?: boolean;
}

export interface ReviewRepositoryPort {
  create(input: CreateReviewInput): Promise<Review>;
  listByProduct(productId: string, page: number, limit: number): Promise<{ reviews: Review[]; total: number }>;
  listByUser(userId: string, page: number, limit: number): Promise<{ reviews: Review[]; total: number }>;
  listAll(page: number, limit: number, search?: string): Promise<{ reviews: Review[]; total: number }>;
  findById(id: string): Promise<Review | null>;
  remove(id: string): Promise<void>;
  averageRating(productId: string): Promise<number | null>;
  hasReviewed(productId: string, userId: string): Promise<boolean>;
}

export class PrismaReviewRepository implements ReviewRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateReviewInput): Promise<Review> {
    return this.prisma.review.create({
      data: {
        productId: input.productId,
        userId: input.userId,
        rating: input.rating,
        title: input.title ?? null,
        comment: input.comment ?? null,
        isVerifiedPurchase: input.isVerifiedPurchase ?? false
      }
    });
  }

  async listByProduct(productId: string, page: number, limit: number): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { productId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.review.count({ where: { productId } })
    ]);
    return { reviews, total };
  }

  async listAll(page: number, limit: number, search?: string): Promise<{ reviews: Review[]; total: number }> {
    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { comment: { contains: search } }
          ]
        }
      : {};
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.review.count({ where })
    ]);
    return { reviews, total };
  }

  async listByUser(userId: string, page: number, limit: number): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { userId },
        include: { product: { select: { id: true, name: true, images: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.review.count({ where: { userId } })
    ]);
    return { reviews, total };
  }

  findById(id: string): Promise<Review | null> {
    return this.prisma.review.findUnique({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.review.delete({ where: { id } });
  }

  async averageRating(productId: string): Promise<number | null> {
    const result = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true
    });
    return result._count > 0 ? Number(result._avg.rating?.toFixed(1) ?? 0) : null;
  }

  hasReviewed(productId: string, userId: string): Promise<boolean> {
    return this.prisma.review
      .findUnique({ where: { productId_userId: { productId, userId } } })
      .then(Boolean);
  }
}
