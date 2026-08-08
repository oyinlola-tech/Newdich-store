import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ActivityLogController } from '../controllers/activity-log.controller.js';
import { isSuperAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerActivityLogRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ActivityLogController>('activity-log.controller');
  const superAdmin = isSuperAdmin(container);

  app.get('/admin/activity-logs', { preHandler: [superAdmin] }, controller.list.bind(controller));
}
