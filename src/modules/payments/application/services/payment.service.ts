import type { PaymentRepositoryPort } from '../../infrastructure/repositories/prisma-payment.repository.js';
import type { OrderService } from '../../../orders/application/services/order.service.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import type { PaymentSettingsService, PaymentProviderName } from './payment-settings.service.js';
import type { CouponService } from '../../../coupons/application/services/coupon.service.js';
import { createGateway } from '../../infrastructure/gateways/gateway.registry.js';
import type { InitializeResult, VerificationResult } from '../../infrastructure/gateways/payment-gateway.types.js';

const KNOWN_PROVIDERS: PaymentProviderName[] = ['paystack', 'flutterwave', 'nomba', 'stripe'];

function toProviderName(value: string | null | undefined): PaymentProviderName {
  if (value && KNOWN_PROVIDERS.includes(value as PaymentProviderName)) {
    return value as PaymentProviderName;
  }
  throw new Error('Unsupported payment provider.');
}

export interface InitiatePaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  email: string;
  method?: 'CARD' | 'TRANSFER' | 'PAY_ON_DELIVERY';
}

export interface PaymentIntent {
  paymentId: string;
  reference: string;
  status: string;
  amount: number;
  method: 'CARD' | 'TRANSFER' | 'PAY_ON_DELIVERY';
  provider: string;
  inline?: InitializeResult['inline'];
  redirectUrl?: string;
  transferAccount?: InitializeResult['transferAccount'];
}

export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepositoryPort,
    private readonly orderService: OrderService | undefined,
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService,
    private readonly settingsService: PaymentSettingsService,
    private readonly couponService?: CouponService
  ) {}

  private activeGateway() {
    const active = this.settingsService.getActiveProvider();
    if (!active) {
      throw new Error(
        'Payments are locked or no payment provider is configured. Ask the store admin to set up and unlock a provider.'
      );
    }
    return createGateway(active.name, active.config);
  }

  async initiate(input: InitiatePaymentInput): Promise<PaymentIntent> {
    const method = input.method ?? 'CARD';
    const reference = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const provider = method === 'PAY_ON_DELIVERY' ? 'manual' : this.settingsService.getActiveProvider()?.name ?? 'manual';

    const payment = await this.paymentRepository.create({
      orderId: input.orderId,
      method,
      amount: input.amount,
      provider,
      reference
    });

    if (method === 'PAY_ON_DELIVERY') {
      return {
        paymentId: payment.id,
        reference,
        status: payment.status,
        amount: input.amount,
        method,
        provider
      };
    }

    const gateway = this.activeGateway();
    const result: InitializeResult = await gateway.initialize({
      amount: input.amount,
      currency: 'NGN',
      email: input.email,
      reference,
      method,
      orderNumber: input.orderNumber
    });

    if (result.reference !== reference) {
      await this.paymentRepository.updateStatus(payment.id, 'PENDING', { reference: result.reference });
    }

    return {
      paymentId: payment.id,
      reference: result.reference,
      status: payment.status,
      amount: input.amount,
      method,
      provider: gateway.name,
      inline: result.inline,
      redirectUrl: result.redirectUrl,
      transferAccount: result.transferAccount
    };
  }

  async verify(reference: string) {
    const payment = await this.paymentRepository.findByReference(reference);
    if (!payment) {
      throw new Error('Payment not found.');
    }
    if (payment.status === 'PAID' || !payment.provider || payment.provider === 'manual') {
      return this.paymentRepository.findByReference(reference);
    }

    const gateway = createGateway(toProviderName(payment.provider), this.settingsService.getProviderConfig(toProviderName(payment.provider)));
    const verified: VerificationResult = await gateway.verify(reference);

    if (verified.status === 'success') {
      return this.markPaid(payment.id, verified.paidAt ?? new Date(), payment.method);
    }

    if (verified.status === 'failed') {
      await this.paymentRepository.updateStatus(payment.id, 'FAILED');
      await this.notifyFailed(payment.orderId, reference);
    }
    return this.paymentRepository.findByReference(reference);
  }

  async handleWebhook(providerName: string, rawBody: string, headers: Record<string, string | string[] | undefined>) {
    const provider = toProviderName(providerName);
    const config = this.settingsService.getProviderConfig(provider);
    const gateway = createGateway(provider, config);

    if (!gateway.verifyWebhookSignature(rawBody, headers)) {
      throw new Error('Invalid webhook signature.');
    }

    let payload: { data?: Record<string, unknown> } | null = null;
    try {
      payload = JSON.parse(rawBody) as { data?: Record<string, unknown> };
    } catch {
      return;
    }

    const data = payload?.data ?? {};
    const reference =
      (data.reference as string) ??
      (data.tx_ref as string) ??
      (data.orderReference as string) ??
      (data.accountRef as string) ??
      this.extractNestedReference(data);
    if (!reference) {
      return;
    }

    const payment = await this.paymentRepository.findByReference(reference);
    if (!payment || payment.status === 'PAID') {
      return;
    }

    const verified = await gateway.verify(reference);
    if (verified.status === 'success') {
      await this.markPaid(payment.id, verified.paidAt ?? new Date(), payment.method);
    }
  }

  private extractNestedReference(data: Record<string, unknown>): string | undefined {
    // Provider-specific nested reference locations:
    //   Nomba:      data.order.orderReference | data.transaction.transactionId
    //   Stripe:     data.data.object.client_reference_id (checkout.session.completed)
    const order = data.order as Record<string, unknown> | undefined;
    if (order?.orderReference && typeof order.orderReference === 'string') {
      return order.orderReference;
    }
    const transaction = data.transaction as Record<string, unknown> | undefined;
    if (transaction?.aliasAccountReference && typeof transaction.aliasAccountReference === 'string') {
      return transaction.aliasAccountReference;
    }
    if (transaction?.merchantTxRef && typeof transaction.merchantTxRef === 'string') {
      return transaction.merchantTxRef;
    }
    if (transaction?.transactionId && typeof transaction.transactionId === 'string') {
      return transaction.transactionId;
    }
    const nestedData = data.data as Record<string, unknown> | undefined;
    const nestedObject = nestedData?.object as Record<string, unknown> | undefined;
    if (nestedObject?.client_reference_id && typeof nestedObject.client_reference_id === 'string') {
      return nestedObject.client_reference_id;
    }
    return undefined;
  }

  getById(paymentId: string) {
    return this.paymentRepository.findById(paymentId);
  }

  async confirm(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found.');
    }
    if (payment.status === 'PAID') {
      return { payment, status: 'confirmed' };
    }
    const updated = await this.markPaid(payment.id, new Date(), payment.method);
    return { payment: updated, status: 'confirmed' };
  }

  paymentMethods(): string[] {
    return ['CARD', 'TRANSFER', 'PAY_ON_DELIVERY'];
  }

  listByOrder(orderId: string) {
    return this.paymentRepository.findByOrderId(orderId);
  }

  list(page: number, limit: number) {
    return this.paymentRepository.list(page, limit);
  }

  async updateStatus(paymentId: string, status: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED') {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found.');
    }
    if (status === 'PAID') {
      if (payment.status === 'PAID') {
        return payment;
      }
      return this.markPaid(paymentId, new Date(), payment.method);
    }
    const updated = await this.paymentRepository.updateStatus(paymentId, status);
    if (status === 'REFUNDED') {
      if (this.orderService) {
        await this.orderService.updateStatus(payment.orderId, 'REFUNDED', 'Order refunded');
      }
      await this.notifyRefunded(payment.orderId, Number(payment.amount), payment.method);
    }
    return updated;
  }

  async refund(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found.');
    }
    if (payment.provider && payment.provider !== 'manual' && payment.reference) {
      const provider = toProviderName(payment.provider);
      const gateway = createGateway(provider, this.settingsService.getProviderConfig(provider));
      await gateway.refund(payment.reference, Number(payment.amount));
    }
    const updated = await this.paymentRepository.updateStatus(payment.id, 'REFUNDED');
    if (this.orderService) {
      await this.orderService.updateStatus(payment.orderId, 'REFUNDED', 'Payment refunded');
    }
    await this.notifyRefunded(payment.orderId, Number(payment.amount), payment.method);
    return updated;
  }

  private async markPaid(paymentId: string, paidAt: Date, method: string) {
    const updated = await this.paymentRepository.updateStatus(paymentId, 'PAID', { paidAt });
    if (this.orderService) {
      await this.orderService.updateStatus(updated.orderId, 'PAID', 'Payment confirmed');
    }

    // Consume the coupon balance (store-credit style coupons) once the order
    // is actually paid. Percentage/one-off coupons only bump the used count.
    if (this.couponService && this.orderService) {
      const order = await this.orderService.getById(updated.orderId);
      if (order?.couponCode) {
        await this.couponService
          .consume(order.couponCode, Number(order.discountAmount ?? 0))
          .catch(() => undefined);
      }
    }

    await this.notifyPaid(updated.orderId, method, updated.reference ?? '', paidAt);
    await this.notifyAdminPaid(updated.orderId, updated.reference ?? '', paidAt);
    return updated;
  }

  private async notifyPaid(orderId: string, method: string, reference: string, paidAt: Date): Promise<void> {
    if (!this.orderService) return;
    const order = await this.orderService.getById(orderId);
    if (!order) return;
    const user = await this.userRepository.findById(order.userId);
    if (!user) return;

    await this.mailerService.sendOrderConfirmation(
      { email: user.email, name: user.name },
      {
        userName: user.name,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price)
        })),
        subtotal: Number(order.subtotal),
        shippingAmount: Number(order.shippingAmount),
        taxAmount: Number(order.taxAmount),
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),
        placedAt: order.placedAt
      }
    );
    await this.mailerService.sendPaymentReceipt(
      { email: user.email, name: user.name },
      {
        orderNumber: order.orderNumber,
        amount: Number(order.total),
        method: method === 'PAY_ON_DELIVERY' ? 'Pay on Delivery' : method,
        reference,
        paidAt
      }
    );
  }

  private async notifyAdminPaid(orderId: string, reference: string, paidAt: Date): Promise<void> {
    if (!this.orderService) return;
    const order = await this.orderService.getById(orderId);
    if (!order) return;
    const user = await this.userRepository.findById(order.userId);
    if (!user) return;

    await this.mailerService.sendAdminAlert({
      subject: `Payment received — order ${order.orderNumber}`,
      body: `${user.name} paid ₦${Number(order.total).toLocaleString('en-NG')} for order #${order.orderNumber} (${reference}) on ${paidAt.toISOString()}.`
    });
  }

  private async notifyFailed(orderId: string, reference: string): Promise<void> {
    if (!this.orderService) return;
    const order = await this.orderService.getById(orderId);
    if (!order) return;
    const user = await this.userRepository.findById(order.userId);
    if (!user) return;

    await this.mailerService.sendPaymentFailed(
      { email: user.email, name: user.name },
      { orderNumber: order.orderNumber, amount: Number(order.total), reference }
    );
  }

  private async notifyRefunded(orderId: string, amount: number, method: string): Promise<void> {
    if (!this.orderService) return;
    const order = await this.orderService.getById(orderId);
    if (!order) return;
    const user = await this.userRepository.findById(order.userId);
    if (!user) return;

    await this.mailerService.sendRefundIssued(
      { email: user.email, name: user.name },
      { orderNumber: order.orderNumber, amount, method: method === 'PAY_ON_DELIVERY' ? 'Pay on Delivery' : method }
    );
  }
}
