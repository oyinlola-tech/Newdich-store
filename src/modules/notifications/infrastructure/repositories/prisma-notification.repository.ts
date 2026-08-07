import type { PrismaClient } from '@prisma/client';
import type { Notification, NotificationType } from '@prisma/client';

export interface NotificationRepositoryPort {
  listByUser(userId: string, page: number, limit: number): Promise<{ notifications: Notification[]; total: number }>;
  unreadCount(userId: string): Promise<number>;
  markRead(userId: string, notificationId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  create(input: { userId: string; type: NotificationType; title: string; body: string }): Promise<Notification>;
  broadcast(input: { type: NotificationType; title: string; body: string; userIds?: string[] }): Promise<void>;
}

export class PrismaNotificationRepository implements NotificationRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async listByUser(userId: string, page: number, limit: number): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.notification.count({ where: { userId } })
    ]);
    return { notifications, total };
  }

  unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() }
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() }
    });
  }

  async create(input: { userId: string; type: NotificationType; title: string; body: string }): Promise<Notification> {
    return this.prisma.notification.create({ data: input });
  }

  async broadcast(input: { type: NotificationType; title: string; body: string; userIds?: string[] }): Promise<void> {
    const where = input.userIds && input.userIds.length > 0 ? { id: { in: input.userIds } } : {};
    const users = await this.prisma.user.findMany({ where, select: { id: true } });
    if (users.length === 0) return;
    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: input.type,
        title: input.title,
        body: input.body
      }))
    });
  }
}
