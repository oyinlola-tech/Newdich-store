import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { NewsletterController } from '../controllers/newsletter.controller.js';
import { adminPermission } from '../../../auth/presentation/guards/admin.guard.js';

export function registerNewsletterRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<NewsletterController>('newsletter.controller');

  app.post('/newsletter/subscribe', controller.subscribe.bind(controller));
  app.post('/newsletter/unsubscribe', controller.unsubscribe.bind(controller));

  app.get('/admin/newsletter/subscribers', { preHandler: adminPermission(container, 'communications.manage') }, controller.adminList.bind(controller));
  app.get('/admin/newsletter/counts', { preHandler: adminPermission(container, 'communications.manage') }, controller.adminCounts.bind(controller));
}
