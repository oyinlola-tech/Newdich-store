import type { Otp, OtpPurpose } from '@prisma/client';

export interface CreateOtpInput {
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface OtpRepositoryPort {
  create(input: CreateOtpInput): Promise<Otp>;
  findActiveByToken(tokenHash: string): Promise<Otp | null>;
  incrementAttempts(id: string): Promise<Otp>;
  markVerified(id: string): Promise<Otp>;
  revokeAllForEmail(email: string): Promise<Otp[]>;
}
