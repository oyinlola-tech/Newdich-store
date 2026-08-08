import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { AuditService } from './application/services/audit.service.js';
import { AuditController } from './presentation/controllers/audit.controller.js';
import { registerAuditRoutes } from './presentation/routes/audit.route.js';

export function registerAuditModule(container: Container, app: FastifyInstance): void {
  container.register('audit.service', (c) => new AuditService(c.get('prisma')));
  container.register('audit.controller', (c) => new AuditController(c.get('audit.service')));

  registerAuditRoutes(app, container);
}
