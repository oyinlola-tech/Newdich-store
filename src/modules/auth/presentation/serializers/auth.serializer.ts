import type { User } from '@prisma/client';
import type { AuthUserOutput, AdminOutput } from '../../domain/types/auth.types.js';

export function toAuthUser(user: User): AuthUserOutput {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role === 'ADMIN' ? 'admin' : 'customer',
    status: user.status === 'ACTIVE' ? 'active' : 'suspended',
    createdAt: user.createdAt
  };
}

export function toAdminOutput(user: User): AdminOutput {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role === 'SUPER_ADMIN' ? 'superadmin' : 'admin',
    permissions: Array.isArray(user.permissions) ? (user.permissions as string[]) : [],
    status: user.status === 'ACTIVE' ? 'active' : 'suspended',
    createdAt: user.createdAt
  };
}
