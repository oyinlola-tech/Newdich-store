import type { PrismaClient } from '@prisma/client';

export class ReviewPromptService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, productId: string, orderId: string, daysValid = 14) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    await this.prisma.reviewPrompt.create({
      data: { userId, productId, orderId, expiresAt }
    });
  }

  async pendingForUser(userId: string) {
    return this.prisma.reviewPrompt.findMany({
      where: { userId, status: 'PENDING', expiresAt: { gte: new Date() } }
    });
  }

  async markReviewed(promptId: string) {
    await this.prisma.reviewPrompt.update({
      where: { id: promptId },
      data: { status: 'REVIEWED' }
    });
  }

  async markExpired() {
    await this.prisma.reviewPrompt.updateMany({
      where: { status: 'PENDING', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' }
    });
  }
}
