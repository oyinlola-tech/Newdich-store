import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { MediaController } from '../controllers/media.controller.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerMediaRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<MediaController>('media.controller');
  const admin = isAdmin(container);

  app.post('/admin/media/upload', { preHandler: [admin] }, controller.upload.bind(controller));
  app.delete('/admin/media', { preHandler: [admin] }, controller.remove.bind(controller));
}
