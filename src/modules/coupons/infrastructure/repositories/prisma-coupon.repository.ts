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
}

export interface CouponRepositoryPort {
  create(input: CreateCouponInput): Promise<Coupon>;
  findByCode(code: string): Promise<Coupon | null>;
  findById(id: string): Promise<Coupon | null>;
  list(page: number, limit: number, status?: string): Promise<{ coupons: Coupon[]; total: number }>;
  update(id: string, input: UpdateCouponInput): Promise<Coupon>;
  remove(id: string): Promise<void>;
  incrementUsed(code: string): Promise<void>;
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
        validUntil: input.validUntil ? new Date(input.validUntil) : null
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
        take: limit
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
        status: input.status
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.coupon.delete({ where: { id } });
  }

  async incrementUsed(code: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } }
    });
  }
}
