import type { PrismaClient, User } from '@prisma/client';
import type {
  AuthRepositoryPort,
  CreateUserInput,
  UpdateUserPatch
} from '../../application/ports/auth.repository.js';

export class PrismaAuthRepository implements AuthRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data: input });
  }

  update(id: string, patch: UpdateUserPatch): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: patch });
  }

  markEmailVerified(id: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { emailVerifiedAt: new Date() } });
  }

  async markLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}
