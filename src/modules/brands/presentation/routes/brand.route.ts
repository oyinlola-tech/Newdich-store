import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { BrandController } from '../controllers/brand.controller.js';
import { isAdmin, requirePermission } from '../../../auth/presentation/guards/admin.guard.js';

export function registerBrandRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<BrandController>('brand.controller');
  const userRepository = container.get<{ getPermissions(userId: string): Promise<string[]> }>('user.repository');

  app.get('/brands', controller.listPublic.bind(controller));
  app.get('/brands/:idOrSlug', controller.get.bind(controller));

  app.get('/admin/brands', { preHandler: isAdmin(container) }, controller.listAdmin.bind(controller));
  app.post(
    '/admin/brands',
    { preHandler: requirePermission(container, userRepository.getPermissions.bind(userRepository), 'products.manage') },
    controller.create.bind(controller)
  );
  app.put(
    '/admin/brands/:id',
    { preHandler: requirePermission(container, userRepository.getPermissions.bind(userRepository), 'products.manage') },
    controller.update.bind(controller)
  );
  app.delete(
    '/admin/brands/:id',
    { preHandler: requirePermission(container, userRepository.getPermissions.bind(userRepository), 'products.manage') },
    controller.delete.bind(controller)
  );
}
