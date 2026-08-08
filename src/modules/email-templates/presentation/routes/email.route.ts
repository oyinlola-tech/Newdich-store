import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { EmailController } from '../controllers/email.controller.js';
import { adminPermission, isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerEmailRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<EmailController>('email.controller');
  const admin = isAdmin(container);

  app.post('/emails/send', { preHandler: [admin, adminPermission(container, 'emails.manage')] }, controller.send.bind(controller));
}
