import type { PrismaClient, PasswordReset } from '@prisma/client';
import type {
  CreatePasswordResetInput,
  PasswordResetRepositoryPort
} from '../../application/ports/password-reset.repository.js';

export class PrismaPasswordResetRepository implements PasswordResetRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: CreatePasswordResetInput): Promise<PasswordReset> {
    return this.prisma.passwordReset.create({ data: input });
  }

  findByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    return this.prisma.passwordReset.findUnique({ where: { tokenHash } });
  }

  markUsed(id: string): Promise<PasswordReset> {
    return this.prisma.passwordReset.update({ where: { id }, data: { usedAt: new Date() } });
  }
}
