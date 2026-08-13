import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ReturnController } from '../controllers/return.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';
import { adminPermission, isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerReturnRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ReturnController>('return.controller');
  const auth = authenticate(container);
  const admin = isAdmin(container);

  app.post('/returns', { preHandler: [auth] }, controller.create.bind(controller));
  app.get('/returns', { preHandler: [auth] }, controller.listMine.bind(controller));

  app.get('/admin/returns', { preHandler: [admin] }, controller.adminList.bind(controller));
  app.get('/admin/returns/:id', { preHandler: [admin] }, controller.adminGet.bind(controller));
  app.put('/admin/returns/:id/status', { preHandler: adminPermission(container, 'returns.manage') }, controller.updateStatus.bind(controller));
  app.post('/admin/returns/:id/notes', { preHandler: adminPermission(container, 'returns.manage') }, controller.addNote.bind(controller));
}
