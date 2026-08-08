import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { EmailTemplateController } from '../controllers/email-template.controller.js';
import { adminPermission, isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerEmailTemplateRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<EmailTemplateController>('email-template.controller');
  const admin = isAdmin(container);

  app.get('/admin/email-templates', { preHandler: [admin] }, controller.list.bind(controller));
  app.post('/admin/email-templates', { preHandler: adminPermission(container, 'emails.manage') }, controller.create.bind(controller));
  app.put('/admin/email-templates/:id', { preHandler: adminPermission(container, 'emails.manage') }, controller.update.bind(controller));
  app.delete('/admin/email-templates/:id', { preHandler: adminPermission(container, 'emails.manage') }, controller.remove.bind(controller));
}
