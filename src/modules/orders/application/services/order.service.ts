import type { OrderRepositoryPort, CreateOrderInput } from '../../infrastructure/repositories/prisma-order.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';

const EMAILED_STATUSES = new Set(['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'ON_HOLD']);

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService
  ) {}

  create(input: CreateOrderInput) {
    return this.orderRepository.create(input);
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
