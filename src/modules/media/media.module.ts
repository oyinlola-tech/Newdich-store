import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaMediaRepository } from './infrastructure/repositories/prisma-media.repository.js';
import { MediaService } from './application/services/media.service.js';
import { MediaController } from './presentation/controllers/media.controller.js';
import { registerMediaRoutes } from './presentation/routes/media.route.js';

export function registerMediaModule(container: Container, app: FastifyInstance): void {
  container.register('media.repository', (c) => new PrismaMediaRepository(c.get('prisma')));
  container.register('media.service', (c) => new MediaService(c.get('media.repository'), c.get('storage.provider')));
  container.register('media.controller', (c) => new MediaController(c.get('media.service')));

  registerMediaRoutes(app, container);
}
