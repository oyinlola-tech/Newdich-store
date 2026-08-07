import type { PrismaClient } from '@prisma/client';
import type { Return, ReturnReason, ReturnStatus, Refund } from '@prisma/client';

export interface ReturnWithRelations extends Return {
  refund?: Refund | null;
  order?: { id: string; orderNumber: string; total: unknown } | null;
  user?: { id: string; name: string; email: string } | null;
}

export interface ReturnRepositoryPort {
  create(input: {
    orderId: string;
    userId: string;
    reason: ReturnReason;
    detail?: string;
  }): Promise<Return>;
  findById(id: string): Promise<ReturnWithRelations | null>;
  findByUser(userId: string): Promise<ReturnWithRelations[]>;
  findByOrder(orderId: string): Promise<Return | null>;
  list(filters: { status?: string; search?: string }, page: number, limit: number): Promise<{ returns: ReturnWithRelations[]; total: number }>;
  updateStatus(id: string, status: ReturnStatus): Promise<Return>;
  addNote(id: string, note: { text: string; by: string; createdAt: string }): Promise<Return>;
  createRefund(input: { returnId: string; userId: string; amount: number; provider?: string }): Promise<Refund>;
  listRefunds(page: number, limit: number): Promise<{ refunds: Refund[]; total: number }>;
}

export class PrismaReturnRepository implements ReturnRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: {
    orderId: string;
    userId: string;
    reason: ReturnReason;
    detail?: string;
  }): Promise<Return> {
    return this.prisma.return.create({
      data: {
        orderId: input.orderId,
        userId: input.userId,
        reason: input.reason,
        detail: input.detail ?? null,
        notes: []
      }
    });
  }

  findById(id: string): Promise<ReturnWithRelations | null> {
    return this.prisma.return.findUnique({
      where: { id },
      include: {
        refund: true,
        order: { select: { id: true, orderNumber: true, total: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    }) as Promise<ReturnWithRelations | null>;
  }

  findByUser(userId: string): Promise<ReturnWithRelations[]> {
    return this.prisma.return.findMany({
      where: { userId },
      include: {
        refund: true,
        order: { select: { id: true, orderNumber: true, total: true } }
      },
      orderBy: { createdAt: 'desc' }
    }) as Promise<ReturnWithRelations[]>;
  }

  findByOrder(orderId: string): Promise<Return | null> {
    return this.prisma.return.findUnique({ where: { orderId } });
  }

  async list(filters: { status?: string; search?: string }, page: number, limit: number): Promise<{ returns: ReturnWithRelations[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search } },
        { order: { is: { orderNumber: { contains: filters.search } } } },
        { user: { is: { email: { contains: filters.search } } } }
      ];
    }
    const [returns, total] = await this.prisma.$transaction([
      this.prisma.return.findMany({
        where,
        include: {
          refund: true,
          order: { select: { id: true, orderNumber: true, total: true } },
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.return.count({ where })
    ]);
    return { returns: returns as ReturnWithRelations[], total };
  }

  async updateStatus(id: string, status: ReturnStatus): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : undefined
      }
    });
  }

  async addNote(id: string, note: { text: string; by: string; createdAt: string }): Promise<Return> {
    const current = await this.prisma.return.findUnique({ where: { id } });
    const notes = Array.isArray(current?.notes) ? (current?.notes as unknown[]) : [];
    return this.prisma.return.update({
      where: { id },
      data: { notes: [...notes, note] as never }
    });
  }

  async createRefund(input: { returnId: string; userId: string; amount: number; provider?: string }): Promise<Refund> {
    return this.prisma.refund.create({
      data: {
        returnId: input.returnId,
        userId: input.userId,
        amount: input.amount,
        provider: input.provider ?? null
      }
    });
  }

  async listRefunds(page: number, limit: number): Promise<{ refunds: Refund[]; total: number }> {
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
