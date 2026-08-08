import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';
import { adminPermission } from '../../../auth/presentation/guards/admin.guard.js';

export function registerNotificationRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<NotificationController>('notification.controller');
  const auth = authenticate(container);
  
  app.get('/notifications', { preHandler: [auth] }, controller.list.bind(controller));
  app.get('/notifications/unread-count', { preHandler: [auth] }, controller.unreadCount.bind(controller));
  app.put('/notifications/:id/read', { preHandler: [auth] }, controller.markRead.bind(controller));
  app.put('/notifications/read-all', { preHandler: [auth] }, controller.markAllRead.bind(controller));
  app.post('/admin/notifications/broadcast', { preHandler: adminPermission(container, 'notifications.manage') }, controller.broadcast.bind(controller));
}
