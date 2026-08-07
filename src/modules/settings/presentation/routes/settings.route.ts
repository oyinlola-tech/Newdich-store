import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { SettingsController } from '../controllers/settings.controller.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerSettingsRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<SettingsController>('settings.controller');
  const admin = isAdmin(container);

  app.get('/settings', controller.getPublic.bind(controller));
  app.get('/admin/settings', { preHandler: [admin] }, controller.getAll.bind(controller));
  app.put('/admin/settings', { preHandler: [admin] }, controller.update.bind(controller));
}
