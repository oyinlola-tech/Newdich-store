import type { PrismaClient } from '@prisma/client';
import type { Payment, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CreatePaymentInput {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  provider?: string;
  reference?: string;
}

export interface PaymentRepositoryPort {
  create(input: CreatePaymentInput): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByReference(reference: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment[]>;
  updateStatus(id: string, status: PaymentStatus, extra?: { reference?: string; provider?: string; paidAt?: Date }): Promise<Payment>;
  list(page: number, limit: number): Promise<{ payments: Payment[]; total: number }>;
}

export class PrismaPaymentRepository implements PaymentRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreatePaymentInput): Promise<Payment> {
    return this.prisma.payment.create({ data: input });
  }

  findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { id } });
  }

  findByReference(reference: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { reference } });
  }

  findByOrderId(orderId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    extra?: { reference?: string; provider?: string; paidAt?: Date }
  ): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status,
        reference: extra?.reference,
        provider: extra?.provider,
        paidAt: extra?.paidAt ?? undefined
      }
    });
  }

  async list(page: number, limit: number): Promise<{ payments: Payment[]; total: number }> {
    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        include: { order: { select: { orderNumber: true, total: true, userId: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.payment.count()
    ]);
    return { payments, total };
  }
}
