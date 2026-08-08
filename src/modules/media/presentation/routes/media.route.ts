import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { MediaController } from '../controllers/media.controller.js';
import { adminPermission } from '../../../auth/presentation/guards/admin.guard.js';

export function registerMediaRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<MediaController>('media.controller');
  
  app.post('/admin/media/upload', { preHandler: adminPermission(container, 'media.manage') }, controller.upload.bind(controller));
  app.delete('/admin/media', { preHandler: adminPermission(container, 'media.manage') }, controller.remove.bind(controller));
}
