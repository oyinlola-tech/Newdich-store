import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaRequestLogRepository } from './infrastructure/repositories/prisma-request-log.repository.js';
import { RequestLogService } from './application/services/request-log.service.js';
import { RequestLogController } from './presentation/controllers/request-log.controller.js';
import { registerRequestLogRoutes } from './presentation/routes/request-log.route.js';

export function registerRequestLogsModule(container: Container, app: FastifyInstance): void {
  container.register('request-log.repository', (c) => new PrismaRequestLogRepository(c.get('prisma')));
  container.register('request-log.service', (c) =>
    new RequestLogService(c.get('request-log.repository'))
  );
  container.register('request-log.controller', (c) =>
    new RequestLogController(c.get('request-log.service'))
  );

  registerRequestLogRoutes(app, container);
}
