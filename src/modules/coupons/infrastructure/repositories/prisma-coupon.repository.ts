import type { PrismaClient } from '@prisma/client';
import type { Coupon, CouponStatus, DiscountType } from '@prisma/client';

export interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: string;
  validUntil?: string;
  balance?: number;
  userId?: string;
}

export interface UpdateCouponInput {
  discountType?: DiscountType;
  discountValue?: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  status?: CouponStatus;
  balance?: number | null;
  userId?: string | null;
}

export interface CouponRepositoryPort {
  create(input: CreateCouponInput): Promise<Coupon>;
  findByCode(code: string): Promise<Coupon | null>;
  findById(id: string): Promise<Coupon | null>;
  list(page: number, limit: number, status?: string): Promise<{ coupons: Coupon[]; total: number }>;
  update(id: string, input: UpdateCouponInput): Promise<Coupon>;
  remove(id: string): Promise<void>;
  consume(code: string, amount: number): Promise<void>;
}

export class PrismaCouponRepository implements CouponRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateCouponInput): Promise<Coupon> {
    return this.prisma.coupon.create({
      data: {
        code: input.code.toUpperCase(),
        discountType: input.discountType,
        discountValue: input.discountValue,
        minOrderAmount: input.minOrderAmount ?? null,
        maxDiscountAmount: input.maxDiscountAmount ?? null,
        usageLimit: input.usageLimit ?? null,
        validFrom: input.validFrom ? new Date(input.validFrom) : null,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        balance: input.balance ?? null,
        userId: input.userId ?? null
      }
    });
  }

  findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  }

  findById(id: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({ where: { id } });
  }

  async list(page: number, limit: number, status?: string): Promise<{ coupons: Coupon[]; total: number }> {
    const where = status ? { status: status as CouponStatus } : {};
    const [coupons, total] = await this.prisma.$transaction([
      this.prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true } } }
      }),
      this.prisma.coupon.count({ where })
    ]);
    return { coupons, total };
  }

  async update(id: string, input: UpdateCouponInput): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        discountType: input.discountType,
        discountValue: input.discountValue,
        minOrderAmount: input.minOrderAmount,
        maxDiscountAmount: input.maxDiscountAmount,
        usageLimit: input.usageLimit,
        validFrom: input.validFrom ? new Date(input.validFrom) : input.validFrom,
        validUntil: input.validUntil ? new Date(input.validUntil) : input.validUntil,
        status: input.status,
        balance: input.balance,
        userId: input.userId
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.coupon.delete({ where: { id } });
  }

  async consume(code: string, amount: number): Promise<void> {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) {
      throw new Error('Coupon not found.');
    }
    const currentBalance = coupon.balance === null || coupon.balance === undefined ? null : Number(coupon.balance);
    const nextBalance = currentBalance === null ? null : Math.max(0, Math.round((currentBalance - amount) * 100) / 100);
    await this.prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        usedCount: { increment: 1 },
        balance: nextBalance
      }
    });
  }
}
