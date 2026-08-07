import type { PrismaClient, Session } from '@prisma/client';
import type { CreateSessionInput, SessionRepositoryPort } from '../../application/ports/session.repository.js';

export class PrismaSessionRepository implements SessionRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: CreateSessionInput): Promise<Session> {
    return this.prisma.session.create({ data: input });
  }

  findByRefreshTokenHash(refreshTokenHash: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { refreshTokenHash } });
  }

  revokeById(id: string): Promise<Session> {
    return this.prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  revokeAllForUser(userId: string): Promise<number> {
    return this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    }).then((result) => result.count);
  }

  deleteExpired(): Promise<number> {
    return this.prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }).then((r) => r.count);
  }
}
