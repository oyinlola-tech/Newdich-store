import type { PrismaClient, Refund, RefundStatus } from '@prisma/client';

export interface RefundRepositoryPort {
  create(input: { returnId: string; userId: string; amount: number; provider?: string }): Promise<Refund>;
  findById(id: string): Promise<Refund | null>;
  findByUser(userId: string): Promise<Refund[]>;
  updateStatus(id: string, status: RefundStatus): Promise<Refund>;
  list(page: number, limit: number): Promise<{ refunds: Refund[]; total: number }>;
}

export class PrismaRefundRepository implements RefundRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: { returnId: string; userId: string; amount: number; provider?: string }): Promise<Refund> {
    return this.prisma.refund.create({
      data: {
        returnId: input.returnId,
        userId: input.userId,
        amount: input.amount,
        provider: input.provider ?? null
      }
    });
  }

  findById(id: string): Promise<Refund | null> {
    return this.prisma.refund.findUnique({ where: { id } });
  }

  findByUser(userId: string): Promise<Refund[]> {
    return this.prisma.refund.findMany({
      where: { userId },
      include: { return: { include: { order: { select: { orderNumber: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  updateStatus(id: string, status: RefundStatus): Promise<Refund> {
    return this.prisma.refund.update({
      where: { id },
      data: {
        status,
        refundedAt: status === 'COMPLETED' ? new Date() : undefined
      }
    });
  }

  async list(page: number, limit: number): Promise<{ refunds: Refund[]; total: number }> {
    const [refunds, total] = await this.prisma.$transaction([
      this.prisma.refund.findMany({
        include: {
          return: { include: { order: { select: { orderNumber: true } } } },
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.refund.count()
    ]);
    return { refunds, total };
  }
}
