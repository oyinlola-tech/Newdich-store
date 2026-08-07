import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import { UserController } from '../controllers/user.controller.js';
import { AdminUserController } from '../controllers/admin-user.controller.js';
import { StaffController } from '../controllers/staff.controller.js';
import { requireAuth } from '../../../auth/presentation/guards/auth.guard.js';
import { requireAdmin, requireSuperAdmin } from '../../../auth/presentation/guards/admin.guard.js';
import type { TokenService } from '../../../auth/infrastructure/security/token.service.js';

export function registerUserRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<UserController>('user.controller');
  const tokenService = container.get<TokenService>('token.service');

  const authGuard = requireAuth(tokenService);
  app.get('/users/profile', { preHandler: authGuard }, controller.getProfile.bind(controller));
  app.put('/users/profile', { preHandler: authGuard }, controller.updateProfile.bind(controller));
  app.get('/users/:id', { preHandler: authGuard }, controller.get.bind(controller));
}

export function registerAdminUserRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<AdminUserController>('admin-user.controller');
  const tokenService = container.get<TokenService>('token.service');
  const adminGuard = requireAdmin(tokenService);

  app.get('/admin/users', { preHandler: adminGuard }, controller.list.bind(controller));
  app.get('/admin/users/:id', { preHandler: adminGuard }, controller.get.bind(controller));
  app.put('/admin/users/:id', { preHandler: adminGuard }, controller.update.bind(controller));
}

export function registerStaffRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<StaffController>('staff.controller');
  const tokenService = container.get<TokenService>('token.service');
  const superAdminGuard = requireSuperAdmin(tokenService);

  app.get('/admin/staff', { preHandler: superAdminGuard }, controller.list.bind(controller));
  app.get('/admin/staff/roles', { preHandler: superAdminGuard }, controller.roleCatalog.bind(controller));
  app.get('/admin/staff/:id', { preHandler: superAdminGuard }, controller.get.bind(controller));
  app.post('/admin/staff', { preHandler: superAdminGuard }, controller.create.bind(controller));
  app.put('/admin/staff/:id', { preHandler: superAdminGuard }, controller.update.bind(controller));
  app.delete('/admin/staff/:id', { preHandler: superAdminGuard }, controller.remove.bind(controller));
}
