import type { Session } from '@prisma/client';

export interface CreateSessionInput {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
}

export interface SessionRepositoryPort {
  create(input: CreateSessionInput): Promise<Session>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<Session | null>;
  revokeById(id: string): Promise<Session>;
  revokeAllForUser(userId: string): Promise<number>;
  deleteExpired(): Promise<number>;
}
