import type { PasswordReset } from '@prisma/client';

export interface CreatePasswordResetInput {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface PasswordResetRepositoryPort {
  create(input: CreatePasswordResetInput): Promise<PasswordReset>;
  findByTokenHash(tokenHash: string): Promise<PasswordReset | null>;
  markUsed(id: string): Promise<PasswordReset>;
}
