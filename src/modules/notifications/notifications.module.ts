import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository.js';
import { NotificationService } from './application/services/notification.service.js';
import { NotificationController } from './presentation/controllers/notification.controller.js';
import { registerNotificationRoutes } from './presentation/routes/notification.route.js';

export function registerNotificationsModule(container: Container, app: FastifyInstance): void {
  container.register('notification.repository', (c) => new PrismaNotificationRepository(c.get('prisma')));
  container.register('notification.service', (c) =>
    new NotificationService(
      c.get('notification.repository'),
      c.get('user.repository'),
      c.get('mailer.service')
    )
  );
  container.register('notification.controller', (c) => new NotificationController(c.get('notification.service')));

  registerNotificationRoutes(app, container);
}
