import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import { CategoryController } from '../controllers/category.controller.js';
import { requireAdmin } from '../../../auth/presentation/guards/admin.guard.js';
import type { TokenService } from '../../../auth/infrastructure/security/token.service.js';

export function registerCategoryRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<CategoryController>('category.controller');
  const tokenService = container.get<TokenService>('token.service');
  const adminGuard = requireAdmin(tokenService);

  app.get('/categories', controller.listPublic.bind(controller));
  app.get('/categories/tree', controller.tree.bind(controller));
  app.get('/categories/:idOrSlug', controller.get.bind(controller));

  app.get('/admin/categories', { preHandler: adminGuard }, controller.listAdmin.bind(controller));
  app.post('/admin/categories', { preHandler: adminGuard }, controller.create.bind(controller));
  app.put('/admin/categories/:id', { preHandler: adminGuard }, controller.update.bind(controller));
  app.delete('/admin/categories/:id', { preHandler: adminGuard }, controller.delete.bind(controller));
}
