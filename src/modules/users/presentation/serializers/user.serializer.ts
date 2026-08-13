import type { User } from '@prisma/client';

export interface UserOutput {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  birthday: string | null;
  role: 'customer' | 'admin';
  status: 'active' | 'suspended';
  emailVerified: boolean;
  createdAt: Date;
}

export function toUserOutput(user: User): UserOutput {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : null,
    role: user.role === 'ADMIN' ? 'admin' : 'customer',
    status: user.status === 'ACTIVE' ? 'active' : 'suspended',
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt
  };
}
