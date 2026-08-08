import type { PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import type {
  CreateStaffInput,
  UpdateStaffInput,
  UserListFilters,
  UserRepositoryPort,
  UserListResult
} from '../../application/ports/user.repository.js';

export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByIds(ids: string[]): Promise<User[]> {
    return this.prisma.user.findMany({ where: { id: { in: ids } } });
  }

  update(id: string, data: { name?: string; email?: string; phone?: string | null; role?: UserRole; status?: UserStatus }): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async list(filters: UserListFilters): Promise<UserListResult> {
    const where = filters.search
      ? {
          OR: [
            { name: { contains: filters.search } },
            { email: { contains: filters.search } },
            { phone: { contains: filters.search } }
          ]
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.user.count({ where })
    ]);

    return { users, total };
  }

  count(): Promise<number> {
    return this.prisma.user.count();
  }

  async createStaff(input: CreateStaffInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        permissions: (input.permissions ?? []) as never
      }
    });
  }

  async listStaff(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStaff(id: string, input: UpdateStaffInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone,
        role: input.role,
        status: input.status,
        permissions: input.permissions ? (input.permissions as never) : undefined,
        passwordHash: input.passwordHash
      }
    });
  }

  async deleteStaff(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async getPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];
    if (user.role === 'SUPER_ADMIN') return [...ALL_PERMISSIONS];
    if (user.role === 'ADMIN' && !user.permissions) return [...ALL_PERMISSIONS];
    return Array.isArray(user.permissions) ? (user.permissions as string[]) : [];
  }
}

export const ALL_PERMISSIONS = [
  'products.manage',
  'categories.manage',
  'inventory.manage',
  'orders.manage',
  'customers.manage',
  'coupons.manage',
  'returns.manage',
  'payments.manage',
  'shipping.manage',
  'media.manage',
  'settings.manage',
  'staff.manage',
  'reviews.manage',
  'notifications.manage',
  'analytics.view'
] as const;
