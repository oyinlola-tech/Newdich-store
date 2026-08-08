import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { AuditController } from '../controllers/audit.controller.js';
import { isSuperAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerAuditRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<AuditController>('audit.controller');
  const superAdmin = isSuperAdmin(container);

  app.get('/admin/audit/login-logs', { preHandler: [superAdmin] }, controller.loginLogs.bind(controller));
}
