import type { PaymentRepositoryPort } from '../../infrastructure/repositories/prisma-payment.repository.js';
import type { OrderService } from '../../../orders/application/services/order.service.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import { PaystackClient } from '../../../../integrations/paystack/paystack.client.js';

export interface InitiatePaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  email: string;
  method?: 'CARD' | 'TRANSFER' | 'PAY_ON_DELIVERY';
}

export class PaymentService {
  private readonly paystack: PaystackClient;

  constructor(
    private readonly paymentRepository: PaymentRepositoryPort,
    private readonly orderService: OrderService,
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService,
    secretKey: string
  ) {
    this.paystack = new PaystackClient(secretKey);
  }

  async initiate(input: InitiatePaymentInput) {
    const method = input.method ?? 'CARD';
    const reference = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await this.paymentRepository.create({
      orderId: input.orderId,
      method,
      amount: input.amount,
      provider: 'paystack',
      reference
    });

    let authorizationUrl: string | null = null;
    if (method !== 'PAY_ON_DELIVERY') {
      const result = await this.paystack.initializeTransaction({
        amountKobo: Math.round(input.amount * 100),
        email: input.email,
        reference,
        metadata: { orderId: input.orderId, orderNumber: input.orderNumber }
      });
      authorizationUrl = result.authorization_url;
    }

    return { paymentId: payment.id, payment, authorizationUrl };
  }

  async verify(reference: string) {
    const payment = await this.paymentRepository.findByReference(reference);
    if (!payment) {
      throw new Error('Payment not found.');
    }

    const verified = await this.paystack.verifyTransaction(reference);
    if (!verified) {
      return this.paymentRepository.findByReference(reference);
    }

    const success = verified.status === 'success';
    const updated = await this.paymentRepository.updateStatus(payment.id, success ? 'PAID' : 'FAILED', {
      paidAt: success && verified.paid_at ? new Date(verified.paid_at) : undefined,
      provider: 'paystack'
    });

    if (success) {
      await this.orderService.updateStatus(payment.orderId, 'PAID', 'Payment verified via Paystack');
      await this.notifyPaid(payment.orderId, payment.method, payment.reference ?? '', verified.paid_at);
    } else {
      await this.notifyFailed(payment.orderId, payment.reference ?? '');
    }

    return updated;
  }

  async verifyWebhook(reference: string) {
    return this.verify(reference);
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
    const updated = await this.paymentRepository.updateStatus(payment.id, 'PAID', { paidAt: new Date() });
    await this.orderService.updateStatus(payment.orderId, 'PAID', 'Payment confirmed');
    await this.notifyPaid(payment.orderId, payment.method, payment.reference ?? '');
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
    const payment = await this.paymentRepository.updateStatus(paymentId, status);
    if (status === 'REFUNDED') {
      await this.orderService.updateStatus(payment.orderId, 'REFUNDED', 'Order refunded');
      await this.notifyRefunded(payment.orderId, Number(payment.amount), payment.method);
    }
    if (status === 'PAID') {
      await this.orderService.updateStatus(payment.orderId, 'PAID', 'Payment confirmed');
      await this.notifyPaid(payment.orderId, payment.method, payment.reference ?? '');
    }
    return payment;
  }

  async refund(paymentId: string) {
    const payment = await this.paymentRepository.updateStatus(paymentId, 'REFUNDED');
    await this.orderService.updateStatus(payment.orderId, 'REFUNDED', 'Payment refunded');
    await this.notifyRefunded(payment.orderId, Number(payment.amount), payment.method);
    return payment;
  }

  private async notifyPaid(orderId: string, method: string, reference: string, paidAt?: Date | string | null): Promise<void> {
    const order = await this.orderService.getById(orderId);
    if (!order) return;
    const user = await this.userRepository.findById(order.userId);
    if (!user) return;

    await this.mailerService.sendPaymentReceipt(
      { email: user.email, name: user.name },
      {
        orderNumber: order.orderNumber,
        amount: Number(order.total),
        method: method === 'PAY_ON_DELIVERY' ? 'Pay on Delivery' : method,
        reference,
        paidAt: paidAt ? new Date(paidAt) : new Date()
      }
    );
  }

  private async notifyFailed(orderId: string, reference: string): Promise<void> {
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
    const order = await this.orderService.getById(orderId);
    if (!order) return;
    const user = await this.userRepository.findById(order.userId);
    if (!user) return;

    await this.mailerService.sendRefundIssued(
      { email: user.email, name: user.name },
      { orderNumber: order.orderNumber, amount: Number(amount), method: method === 'PAY_ON_DELIVERY' ? 'Pay on Delivery' : method }
    );
  }
}
