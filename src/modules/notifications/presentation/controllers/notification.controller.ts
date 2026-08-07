import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { NotificationService } from '../../application/services/notification.service.js';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const query = request.query as { page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 30);
    const result = await this.notificationService.list(userId, page, limit);
    const unread = await this.notificationService.unreadCount(userId);
    return reply.send({ notifications: result.notifications, total: result.total, unread, page, limit });
  }

  async unreadCount(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const unread = await this.notificationService.unreadCount(userId);
    return reply.send({ unread });
  }

  async markRead(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    await this.notificationService.markRead(userId, id);
    return reply.send({ message: 'Notification marked as read.' });
  }

  async markAllRead(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    await this.notificationService.markAllRead(userId);
    return reply.send({ message: 'All notifications marked as read.' });
  }

  async broadcast(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { type?: 'ORDER' | 'PRODUCT' | 'PROMOTION' | 'SYSTEM'; title?: string; body?: string; userIds?: string[] };
    if (!body.title || !body.body) {
      return reply.status(400).send({ message: 'title and body are required.' });
    }
    await this.notificationService.broadcast({
      type: body.type ?? 'SYSTEM',
      title: body.title,
      body: body.body,
      userIds: body.userIds
    });
    return reply.status(201).send({ message: 'Notification broadcast sent.' });
  }
}
