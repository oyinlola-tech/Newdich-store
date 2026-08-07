import type { OrderRepositoryPort, CreateOrderInput } from '../../infrastructure/repositories/prisma-order.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';
import type { CartRepositoryPort } from '../../../carts/infrastructure/repositories/prisma-cart.repository.js';

const EMAILED_STATUSES = new Set(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'ON_HOLD']);

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService,
    private readonly cartRepository: CartRepositoryPort
  ) {}

  create(input: CreateOrderInput) {
    return this.orderRepository.create(input);
  }

  async createCustomerOrder(
    userId: string,
    input: {
      shippingAddress?: Record<string, unknown>;
      items?: { productId: string; name?: string; quantity?: number; price?: number }[];
      total?: number;
      payment?: { paymentId?: string; status?: string };
      note?: string;
    }
  ) {
    const items = (input.items ?? []).map((item) => ({
      productId: item.productId,
      variantId: undefined,
      name: item.name ?? 'Product',
      price: Number(item.price ?? 0),
      quantity: Math.max(1, Math.floor(Number(item.quantity ?? 1)))
    }));

    const total = Math.round(Number(input.total ?? 0) * 100) / 100;

    const noteParts: string[] = [];
    if (input.note) noteParts.push(input.note);
    if (input.payment?.paymentId) {
      noteParts.push(`Payment ref: ${input.payment.paymentId} (${input.payment.status ?? 'confirmed'})`);
    }
    if (input.shippingAddress) {
      const s = input.shippingAddress;
      const parts = [s.fullName, s.address, s.city, s.postalCode, s.phone, s.email]
        .filter((v) => typeof v === 'string' && v.length > 0);
      if (parts.length > 0) noteParts.push(`Ship to: ${parts.join(', ')}`);
    }

    const order = await this.orderRepository.create({
      userId,
      items,
      subtotal: total,
      shippingAmount: 0,
      taxAmount: 0,
      discountAmount: 0,
      total,
      note: noteParts.length > 0 ? noteParts.join(' | ') : undefined
    });

    await this.cartRepository.clear(userId);

    const user = await this.userRepository.findById(userId);
    if (user) {
      await this.mailerService.sendOrderConfirmation(
        { email: user.email, name: user.name },
        {
          userName: user.name,
          orderNumber: order.orderNumber,
          subtotal: total,
          shippingAmount: 0,
          taxAmount: 0,
          discountAmount: 0,
          total,
          items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
          placedAt: order.placedAt
        }
      );
      await this.mailerService.sendAdminAlert({
        subject: `New order #${order.orderNumber}`,
        body: `A new order (${order.orderNumber}) was placed for ${total} ${order.currency}.`
      });
    }

    return order;
  }

  addNote(id: string, note: string) {
    return this.orderRepository.addNote(id, note);
  }

  getById(id: string) {
    return this.orderRepository.findById(id);
  }

  getByNumber(orderNumber: string) {
    return this.orderRepository.findByOrderNumber(orderNumber);
  }

  listByUser(userId: string) {
    return this.orderRepository.findByUserId(userId);
  }

  list(filters: { status?: string; search?: string }, page: number, limit: number) {
    return this.orderRepository.list(filters, page, limit);
  }

  async updateStatus(orderId: string, status: string, note?: string) {
    const order = await this.orderRepository.updateStatus(orderId, status as never, note);

    if (EMAILED_STATUSES.has(status)) {
      await this.notifyStatus(order, status);
    }

    return order;
  }

  private async notifyStatus(order: { orderNumber: string; userId: string }, status: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(order.userId);
      if (!user) return;
      await this.mailerService.sendOrderStatusUpdate(
        { email: user.email, name: user.name },
        { orderNumber: order.orderNumber, status }
      );
    } catch (error) {
      /* status emails must never break the order flow */
    }
  }
}
