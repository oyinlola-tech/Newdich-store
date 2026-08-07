import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaSettingsRepository } from './infrastructure/repositories/prisma-settings.repository.js';
import { SettingsService } from './application/services/settings.service.js';
import { SettingsController } from './presentation/controllers/settings.controller.js';
import { registerSettingsRoutes } from './presentation/routes/settings.route.js';

export function registerSettingsModule(container: Container, app: FastifyInstance): void {
  container.register('settings.repository', (c) => new PrismaSettingsRepository(c.get('prisma')));
  container.register('settings.service', (c) => new SettingsService(c.get('settings.repository')));
  container.register('settings.controller', (c) => new SettingsController(c.get('settings.service')));

  registerSettingsRoutes(app, container);
}
