import type { RefundRepositoryPort } from '../../infrastructure/repositories/prisma-refund.repository.js';
import type { ReturnRepositoryPort } from '../../../returns/infrastructure/repositories/prisma-return.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';
import type { OrderService } from '../../../orders/application/services/order.service.js';

export const REFUND_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;

export class RefundService {
  constructor(
    private readonly refundRepository: RefundRepositoryPort,
    private readonly returnRepository: ReturnRepositoryPort,
    private readonly orderService: OrderService,
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService
  ) {}

  async issueForReturn(returnId: string, amount: number, provider?: string) {
    const returnRequest = await this.returnRepository.findById(returnId);
    if (!returnRequest) {
      throw new Error('Return request not found.');
    }
    if (amount <= 0) {
      throw new Error('Refund amount must be positive.');
    }
    await this.returnRepository.updateStatus(returnId, 'APPROVED');
    const refund = await this.refundRepository.create({
      returnId,
      userId: returnRequest.userId,
      amount,
      provider
    });

    await this.notifyUser(returnRequest.orderId, (user, orderNumber) =>
      this.mailerService.sendRefundIssued(
        { email: user.email, name: user.name },
        { orderNumber, amount, method: provider ?? 'Original payment method' }
      )
    );

    return refund;
  }

  list(page: number, limit: number) {
    return this.refundRepository.list(page, limit);
  }

  listByUser(userId: string) {
    return this.refundRepository.findByUser(userId);
  }

  getById(id: string) {
    return this.refundRepository.findById(id);
  }

  async updateStatus(id: string, status: string) {
    if (!REFUND_STATUSES.includes(status as never)) {
      throw new Error(`status must be one of: ${REFUND_STATUSES.join(', ')}.`);
    }
    return this.refundRepository.updateStatus(id, status as never);
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
      /* refund emails must never break the refund flow */
    }
  }
}
