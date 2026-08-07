import type { CouponRepositoryPort } from '../../infrastructure/repositories/prisma-coupon.repository.js';

export class CouponService {
  constructor(private readonly couponRepository: CouponRepositoryPort) {}

  async validate(code: string, orderAmount = 0) {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code.' };
    }

    const now = new Date();
    if (coupon.status !== 'ACTIVE') {
      return { valid: false, message: 'This coupon is no longer active.' };
    }
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, message: 'This coupon is not active yet.' };
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, message: 'This coupon has expired.' };
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon has reached its usage limit.' };
    }
    if (coupon.minOrderAmount !== null && orderAmount < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        message: `Minimum order amount for this coupon is ${coupon.minOrderAmount}.`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((orderAmount * Number(coupon.discountValue)) / 100 * 100) / 100;
      if (coupon.maxDiscountAmount !== null && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discount = Math.min(Number(coupon.discountValue), orderAmount);
    }

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount: discount
    };
  }

  create(input: Parameters<CouponRepositoryPort['create']>[0]) {
    return this.couponRepository.create(input);
  }

  list(page: number, limit: number, status?: string) {
    return this.couponRepository.list(page, limit, status);
  }

  update(id: string, input: Parameters<CouponRepositoryPort['update']>[1]) {
    return this.couponRepository.update(id, input);
  }

  remove(id: string) {
    return this.couponRepository.remove(id);
  }
}
