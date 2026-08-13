import type { ReturnRepositoryPort } from '../../infrastructure/repositories/prisma-return.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';
import type { OrderService } from '../../../orders/application/services/order.service.js';

export const RETURN_REASONS = ['WRONG_ITEM', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'SIZE_FIT', 'OTHER'] as const;

export class ReturnService {
  constructor(
    private readonly returnRepository: ReturnRepositoryPort,
    private readonly orderService: OrderService,
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService
  ) {}

  async create(userId: string, input: { orderId: string; reason: string; detail?: string }) {
    if (!RETURN_REASONS.includes(input.reason as never)) {
      throw new Error(`reason must be one of: ${RETURN_REASONS.join(', ')}.`);
    }
    const existing = await this.returnRepository.findByOrder(input.orderId);
    if (existing) {
      throw new Error('A return request already exists for this order.');
    }
    const returnRequest = await this.returnRepository.create({
      orderId: input.orderId,
      userId,
      reason: input.reason as never,
      detail: input.detail
    });

    await this.notifyUser(returnRequest.orderId, (user, orderNumber) =>
      this.mailerService.sendReturnRequested(
        { email: user.email, name: user.name },
        { orderNumber, reason: input.reason }
      )
    );

    return returnRequest;
  }

  listByUser(userId: string) {
    return this.returnRepository.findByUser(userId);
  }

  getById(id: string) {
    return this.returnRepository.findById(id);
  }

  list(filters: { status?: string; search?: string }, page: number, limit: number) {
    return this.returnRepository.list(filters, page, limit);
  }

  async updateStatus(id: string, status: string) {
    const allowed = ['REQUESTED', 'APPROVED', 'REJECTED', 'PICKED_UP', 'REFUNDED', 'CLOSED'];
    if (!allowed.includes(status)) {
      throw new Error(`status must be one of: ${allowed.join(', ')}.`);
    }
    const returnRequest = await this.returnRepository.updateStatus(id, status as never);

    await this.notifyUser(returnRequest.orderId, (user, orderNumber) =>
      this.mailerService.sendReturnStatusUpdate(
        { email: user.email, name: user.name },
        { orderNumber, status }
      )
    );

    return returnRequest;
  }

  async addNote(id: string, note: { text: string; by: string }) {
    if (!note.text.trim()) {
      throw new Error('Note text is required.');
    }
    return this.returnRepository.addNote(id, {
      text: note.text.trim(),
      by: note.by,
      createdAt: new Date().toISOString()
    });
  }

  private async notifyUser(
    orderId: string,
    send: (user: { email: string; name: string }, orderNumber: string) => Promise<void>
  ): Promise<void> {
    try {
      const order = await this.orderService.getById(orderId);
      if (!order) return;
      const user = await this.userRepository.findById(order.userId);
      if (!user) return;
      await send(user, order.orderNumber);
    } catch {
      /* return emails must never break the return flow */
    }
  }
}
