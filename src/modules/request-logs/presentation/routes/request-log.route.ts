import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { RequestLogController } from '../controllers/request-log.controller.js';
import { isSuperAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerRequestLogRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<RequestLogController>('request-log.controller');
  const superAdmin = isSuperAdmin(container);

  app.get('/admin/request-logs', { preHandler: [superAdmin] }, controller.list.bind(controller));
}
