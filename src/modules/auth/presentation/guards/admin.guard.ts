import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { TokenService } from '../../infrastructure/security/token.service.js';
import { ForbiddenError } from '../../../../core/domain/errors/domain.error.js';
import { requireAuth } from './auth.guard.js';

export function requireAdmin(tokenService: TokenService) {
  return async function adminGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    await requireAuth(tokenService)(request);
    if (!request.user || (request.user.role !== 'ADMIN' && request.user.role !== 'SUPER_ADMIN')) {
      throw new ForbiddenError('Admin access required');
    }
  };
}

export function requireSuperAdmin(tokenService: TokenService) {
  return async function superAdminGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    await requireAuth(tokenService)(request);
    if (request.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Super admin access required');
    }
  };
}

export function requirePermission(
  container: Container,
  getPermissions: (userId: string) => Promise<string[]>,
  permission: string
) {
  return async function permissionGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    await requireAuth(container.get<TokenService>('token.service'))(request);
    if (!request.user) {
      throw new ForbiddenError('Authentication required');
    }
    const permissions = await getPermissions(request.user.id);
    if (!permissions.includes(permission)) {
      throw new ForbiddenError(`Permission "${permission}" required`);
    }
  };
}

export function isAdmin(container: Container) {
  return requireAdmin(container.get<TokenService>('token.service'));
}

export function isSuperAdmin(container: Container) {
  return requireSuperAdmin(container.get<TokenService>('token.service'));
}

export interface PermissionProvider {
  getPermissions(userId: string): Promise<string[]>;
}

export function adminPermission(container: Container, permission: string) {
  const getUserPermissions = (userId: string) =>
    container.get<PermissionProvider>('user.repository').getPermissions(userId);
  return requirePermission(container, getUserPermissions, permission);
}
