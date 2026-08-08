import type { PrismaClient } from '@prisma/client';

export class PrismaReviewPromptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { userId: string; productId: string; orderId: string; expiresAt: Date }) {
    return this.prisma.reviewPrompt.create({ data });
  }

  async findMany(where: Record<string, unknown>) {
    return this.prisma.reviewPrompt.findMany({ where });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.prisma.reviewPrompt.update({ where: { id }, data });
  }

  async updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return this.prisma.reviewPrompt.updateMany({ where, data });
  }
}
