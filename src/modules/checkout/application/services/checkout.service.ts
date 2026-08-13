import type { CheckoutRepository } from '../../infrastructure/checkout.repository.js';
import type { CartRepositoryPort } from '../../../carts/infrastructure/repositories/prisma-cart.repository.js';
import type { OrderService } from '../../../orders/application/services/order.service.js';
import type { PaymentService } from '../../../payments/application/services/payment.service.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';
import type { TaxService } from '../../../tax/application/services/tax.service.js';
import type { CouponService } from '../../../coupons/application/services/coupon.service.js';
import type { ReviewPromptService } from '../../../review-prompts/application/services/review-prompt.service.js';

export const SHIPPING_RATES: Record<string, { fee: number; estimate: string }> = {
  STANDARD: { fee: 2500, estimate: '3 - 5 business days' },
  EXPRESS: { fee: 5000, estimate: '1 - 2 business days' },
  SAME_DAY: { fee: 8000, estimate: 'Same day (Lagos only)' }
};

export interface CheckoutInput {
  userId: string;
  shippingMethod?: 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
  note?: string;
  paymentMethod?: 'CARD' | 'TRANSFER' | 'PAY_ON_DELIVERY';
  couponCode?: string;
}

export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly cartRepository: CartRepositoryPort,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly userRepository: UserRepositoryPort,
    private readonly taxService: TaxService,
    private readonly couponService: CouponService,
    private readonly reviewPromptService?: ReviewPromptService
  ) {}

  async checkout(input: CheckoutInput) {
    const cart = await this.cartRepository.getWithItems(input.userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty.');
    }

    const checkoutItems = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: item.quantity
    }));

    await this.checkoutRepository.validateStock(checkoutItems);

    const subtotal = Math.round(
      cart.items.reduce(
        (sum, item) => sum + (Number(item.product.price) + Number(item.variant?.priceDelta ?? 0)) * item.quantity,
        0
      ) * 100
    ) / 100;

    const method = input.shippingMethod ?? 'STANDARD';
    const shippingRate = SHIPPING_RATES[method];
    if (!shippingRate) {
      throw new Error('Invalid shipping method.');
    }
    const shippingAmount = shippingRate.fee ?? 0;

    const taxRate = await this.taxService.getRate();
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;

    let discountAmount = 0;
    let couponCode: string | null = null;
    if (input.couponCode) {
      const coupon = await this.couponService.validate(input.couponCode, subtotal, input.userId);
      if (!coupon.valid) {
        throw new Error(coupon.message ?? 'Invalid coupon.');
      }
      discountAmount = coupon.discountAmount ?? 0;
      couponCode = coupon.code ?? null;
    }

    const total = Math.round((subtotal + shippingAmount + taxAmount - discountAmount) * 100) / 100;

    if (couponCode) {
      await this.couponService.consume(couponCode, discountAmount);
    }

    const order = await this.orderService.create({
      userId: input.userId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId ?? undefined,
        name: item.product.name,
        price: Number(item.product.price) + Number(item.variant?.priceDelta ?? 0),
        quantity: item.quantity
      })),
      subtotal,
      shippingAmount,
      taxAmount,
      discountAmount,
      total,
      couponCode: couponCode ?? undefined,
      note: input.note
    });

    for (const item of order.items) {
      await this.reviewPromptService?.create(input.userId, item.productId, order.id, 14).catch(() => undefined);
    }

    // Payment first: the order is only finalized (emails, admin alert) once the
    // payment is confirmed via webhook or the confirm endpoint.
    const user = await this.userRepository.findById(input.userId);
    if (!user?.email) {
      throw new Error('User not found for checkout.');
    }
    const email = user.email;

    const payment = await this.paymentService.initiate({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: total,
      email,
      method: input.paymentMethod
    });

    return {
      order: { id: order.id, orderNumber: order.orderNumber, status: order.status, total, currency: order.currency },
      payment: {
        id: payment.paymentId,
        reference: payment.reference,
        status: payment.status,
        provider: payment.provider,
        method: payment.method,
        inline: payment.inline ?? null,
        redirectUrl: payment.redirectUrl ?? null,
        transferAccount: payment.transferAccount ?? null
      },
      shipping: { method, estimate: shippingRate.estimate },
      totals: { subtotal, shippingAmount, taxAmount, discountAmount, total }
    };
  }

  getShippingOptions() {
    return Object.entries(SHIPPING_RATES).map(([method, rate]) => ({
      method,
      fee: rate.fee,
      estimate: rate.estimate
    }));
  }
}
