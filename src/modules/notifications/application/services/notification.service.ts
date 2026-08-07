import type { NotificationRepositoryPort } from '../../infrastructure/repositories/prisma-notification.repository.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService
  ) {}

  list(userId: string, page: number, limit: number) {
    return this.notificationRepository.listByUser(userId, page, limit);
  }

  unreadCount(userId: string) {
    return this.notificationRepository.unreadCount(userId);
  }

  markRead(userId: string, notificationId: string) {
    return this.notificationRepository.markRead(userId, notificationId);
  }

  markAllRead(userId: string) {
    return this.notificationRepository.markAllRead(userId);
  }

  send(userId: string, input: { type: 'ORDER' | 'PRODUCT' | 'PROMOTION' | 'SYSTEM'; title: string; body: string }) {
    return this.notificationRepository.create({ userId, ...input });
  }

  async broadcast(input: {
    type: 'ORDER' | 'PRODUCT' | 'PROMOTION' | 'SYSTEM';
    title: string;
    body: string;
    userIds?: string[];
  }) {
    const userIds = input.userIds ?? [];
    const result = await this.notificationRepository.broadcast({ ...input, userIds });

    if (input.type === 'PROMOTION' && userIds.length > 0) {
      await this.notifyPromotions({ title: input.title, body: input.body, userIds });
    }

    return result;
  }

  private async notifyPromotions(input: { title: string; body: string; userIds: string[] }): Promise<void> {
    try {
      const users = await this.userRepository.findByIds(input.userIds);
      await Promise.all(
        users.map((user) =>
          this.mailerService.sendPromotion(
            { email: user.email, name: user.name },
            { title: input.title, body: input.body }
          )
        )
      );
    } catch (error) {
      /* promotional emails must never break the notification flow */
    }
  }
}
