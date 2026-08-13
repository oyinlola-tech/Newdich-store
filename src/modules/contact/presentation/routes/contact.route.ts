import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ContactController } from '../controllers/contact.controller.js';
import { adminPermission, isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerContactRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ContactController>('contact.controller');
  const admin = isAdmin(container);

  app.post('/contact', controller.create.bind(controller));
  app.post('/contact/subscribe', controller.subscribe.bind(controller));
  app.get('/admin/contact', { preHandler: [admin] }, controller.adminList.bind(controller));
  app.get('/admin/contact/:id', { preHandler: [admin] }, controller.adminGet.bind(controller));
  app.put('/admin/contact/:id/status', { preHandler: adminPermission(container, 'customers.manage') }, controller.updateStatus.bind(controller));
  app.post('/admin/contact/:id/reply', { preHandler: adminPermission(container, 'customers.manage') }, controller.reply.bind(controller));
}
