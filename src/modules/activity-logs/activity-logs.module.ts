import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaActivityLogRepository } from './infrastructure/repositories/prisma-activity-log.repository.js';
import { ActivityLogService } from './application/services/activity-log.service.js';
import { ActivityLogController } from './presentation/controllers/activity-log.controller.js';
import { registerActivityLogRoutes } from './presentation/routes/activity-log.route.js';

export function registerActivityLogsModule(container: Container, app: FastifyInstance): void {
  container.register('activity-log.repository', (c) => new PrismaActivityLogRepository(c.get('prisma')));
  container.register('activity-log.service', (c) =>
    new ActivityLogService(c.get('activity-log.repository'))
  );
  container.register('activity-log.controller', (c) =>
    new ActivityLogController(c.get('activity-log.service'))
  );

  registerActivityLogRoutes(app, container);
}
