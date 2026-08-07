import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { CouponService } from '../../application/services/coupon.service.js';

export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  async validate(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { code?: string; amount?: string };
    if (!query.code) {
      return reply.status(400).send({ message: 'code is required.' });
    }
    const result = await this.couponService.validate(query.code, Number(query.amount ?? 0));
    return reply.send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { status?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.couponService.list(page, limit, query.status);
    return reply.send({ coupons: result.coupons, total: result.total, page, limit });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      code?: string;
      discountType?: 'PERCENTAGE' | 'FIXED';
      discountValue?: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      usageLimit?: number;
      validFrom?: string;
      validUntil?: string;
    };
    if (!body.code || !body.discountType || typeof body.discountValue !== 'number') {
      return reply.status(400).send({ message: 'code, discountType and discountValue are required.' });
    }
    try {
      const coupon = await this.couponService.create({
        code: body.code,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minOrderAmount: body.minOrderAmount,
        maxDiscountAmount: body.maxDiscountAmount,
        usageLimit: body.usageLimit,
        validFrom: body.validFrom,
        validUntil: body.validUntil
      });
      return reply.status(201).send({ coupon });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    if (body.discountType !== undefined && body.discountType !== 'PERCENTAGE' && body.discountType !== 'FIXED') {
      return reply.status(400).send({ message: 'discountType must be PERCENTAGE or FIXED.' });
    }
    if (body.discountValue !== undefined && typeof body.discountValue !== 'number') {
      return reply.status(400).send({ message: 'discountValue must be a number.' });
    }
    if (body.status !== undefined && !['ACTIVE', 'EXPIRED', 'DISABLED'].includes(body.status as string)) {
      return reply.status(400).send({ message: 'status must be ACTIVE, EXPIRED or DISABLED.' });
    }
    try {
      const coupon = await this.couponService.update(id, {
        discountType: body.discountType as 'PERCENTAGE' | 'FIXED' | undefined,
        discountValue: body.discountValue as number | undefined,
        minOrderAmount: body.minOrderAmount === null ? null : (body.minOrderAmount as number | undefined),
        maxDiscountAmount: body.maxDiscountAmount === null ? null : (body.maxDiscountAmount as number | undefined),
        usageLimit: body.usageLimit === null ? null : (body.usageLimit as number | undefined),
        validFrom: body.validFrom === null ? null : (body.validFrom as string | undefined),
        validUntil: body.validUntil === null ? null : (body.validUntil as string | undefined),
        status: body.status as 'ACTIVE' | 'EXPIRED' | 'DISABLED' | undefined
      });
      return reply.send({ coupon });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.couponService.remove(id);
    return reply.send({ message: 'Coupon deleted.' });
  }
}
