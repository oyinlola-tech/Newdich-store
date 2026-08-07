import type { User } from '@prisma/client';
import type { UserRepositoryPort } from '../ports/user.repository.js';
import type { PasswordHasherService } from '../../../auth/infrastructure/security/password-hasher.service.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';

export interface RoleTemplate {
  id: string;
  label: string;
  description: string;
  permissions: string[];
}

export const PERMISSION_CATALOG: { key: string; label: string }[] = [
  { key: 'products.manage', label: 'Products' },
  { key: 'categories.manage', label: 'Categories' },
  { key: 'inventory.manage', label: 'Inventory' },
  { key: 'orders.manage', label: 'Orders' },
  { key: 'customers.manage', label: 'Customers' },
  { key: 'coupons.manage', label: 'Coupons' },
  { key: 'returns.manage', label: 'Returns' },
  { key: 'payments.manage', label: 'Payments' },
  { key: 'shipping.manage', label: 'Shipping' },
  { key: 'media.manage', label: 'Media' },
  { key: 'settings.manage', label: 'Settings' },
  { key: 'staff.manage', label: 'Staff' },
  { key: 'reviews.manage', label: 'Reviews' },
  { key: 'notifications.manage', label: 'Notifications' },
  { key: 'analytics.view', label: 'Analytics' }
];

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'super-admin',
    label: 'Super Admin',
    description: 'Full access to everything, including staff management',
    permissions: PERMISSION_CATALOG.map((p) => p.key)
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Full operational access, no staff management',
    permissions: PERMISSION_CATALOG.map((p) => p.key).filter((key) => key !== 'staff.manage')
  },
  {
    id: 'inventory-manager',
    label: 'Inventory Manager',
    description: 'Products, categories, inventory and media',
    permissions: ['products.manage', 'categories.manage', 'inventory.manage', 'media.manage', 'analytics.view']
  },
  {
    id: 'order-manager',
    label: 'Order Manager',
    description: 'Orders, shipping, payments and returns',
    permissions: ['orders.manage', 'shipping.manage', 'payments.manage', 'returns.manage', 'analytics.view']
  },
  {
    id: 'support-manager',
    label: 'Support Manager',
    description: 'Customers, returns and reviews',
    permissions: ['customers.manage', 'returns.manage', 'reviews.manage', 'orders.manage', 'analytics.view']
  },
  {
    id: 'marketing-manager',
    label: 'Marketing Manager',
    description: 'Coupons, products and notifications',
    permissions: ['coupons.manage', 'products.manage', 'categories.manage', 'notifications.manage', 'analytics.view']
  }
];

export class StaffService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherService,
    private readonly mailerService: MailerService
  ) {}

  async createStaff(input: {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'STAFF';
    roleTemplate?: string;
    permissions?: string[];
  }): Promise<User> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error('A user with this email already exists.');
    }
    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    let permissions = input.permissions ?? [];
    if (permissions.length === 0 && input.roleTemplate) {
      const template = ROLE_TEMPLATES.find((t) => t.id === input.roleTemplate);
      if (!template) {
        throw new Error('Unknown role template.');
      }
      permissions = template.permissions;
    }

    const staff = await this.userRepository.createStaff({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash: await this.passwordHasher.hash(input.password),
      role: input.role,
      permissions
    });

    await this.mailerService.sendWelcome({ email: normalizedEmail, name: input.name.trim() });

    return staff;
  }

  listStaff() {
    return this.userRepository.listStaff();
  }

  async updateStaff(
    id: string,
    input: {
      name?: string;
      phone?: string;
      role?: 'ADMIN' | 'STAFF';
      status?: 'ACTIVE' | 'SUSPENDED';
      roleTemplate?: string;
      permissions?: string[];
      password?: string;
    }
  ): Promise<User> {
    let permissions = input.permissions;
    if (input.permissions === undefined && input.roleTemplate) {
      const template = ROLE_TEMPLATES.find((t) => t.id === input.roleTemplate);
      if (template) {
        permissions = template.permissions;
      }
    }

    const passwordHash = input.password ? await this.passwordHasher.hash(input.password) : undefined;

    return this.userRepository.updateStaff(id, {
      name: input.name,
      phone: input.phone ?? null,
      role: input.role,
      status: input.status,
      permissions,
      passwordHash
    });
  }

  async deleteStaff(id: string): Promise<void> {
    await this.userRepository.deleteStaff(id);
  }

  getRoleTemplates() {
    return ROLE_TEMPLATES;
  }

  getPermissionCatalog() {
    return PERMISSION_CATALOG;
  }
}
