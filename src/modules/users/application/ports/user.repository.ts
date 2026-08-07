import type { User, UserRole, UserStatus } from '@prisma/client';

export interface UserListFilters {
  search?: string;
  page: number;
  limit: number;
}

export interface UserListResult {
  users: User[];
  total: number;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  permissions?: string[];
}

export interface UpdateStaffInput {
  name?: string;
  phone?: string | null;
  role?: UserRole;
  status?: UserStatus;
  permissions?: string[];
  passwordHash?: string;
}

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByIds(ids: string[]): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: { name?: string; email?: string; phone?: string | null; role?: UserRole; status?: UserStatus }): Promise<User>;
  list(filters: UserListFilters): Promise<UserListResult>;
  count(): Promise<number>;
  createStaff(input: CreateStaffInput): Promise<User>;
  listStaff(): Promise<User[]>;
  updateStaff(id: string, input: UpdateStaffInput): Promise<User>;
  deleteStaff(id: string): Promise<void>;
  getPermissions(userId: string): Promise<string[]>;
}
