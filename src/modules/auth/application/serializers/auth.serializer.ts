import type { User } from '@prisma/client';

export interface AuthUserOutput {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'admin';
  status: 'active' | 'suspended';
  createdAt: Date;
}

export interface AdminOutput {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin';
  status: 'active' | 'suspended';
  createdAt: Date;
}

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
    role: 'admin',
    status: user.status === 'ACTIVE' ? 'active' : 'suspended',
    createdAt: user.createdAt
  };
}
