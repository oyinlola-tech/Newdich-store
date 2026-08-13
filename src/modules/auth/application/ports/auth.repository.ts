import type { User } from '@prisma/client';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  acceptedTermsAt?: Date;
  newsletterOptIn?: boolean;
}

export interface UpdateUserPatch {
  name?: string;
  email?: string;
  phone?: string | null;
  passwordHash?: string;
}

export interface AuthRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, patch: UpdateUserPatch): Promise<User>;
  markEmailVerified(id: string): Promise<User>;
  markLastLogin(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<User>;
  logLogin(input: {
    userId?: string | null;
    email: string;
    role?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    success: boolean;
  }): Promise<void>;
}
