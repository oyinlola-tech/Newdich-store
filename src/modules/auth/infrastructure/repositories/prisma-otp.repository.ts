import type { PrismaClient, Otp } from '@prisma/client';
import type { CreateOtpInput, OtpRepositoryPort } from '../../application/ports/otp.repository.js';

export class PrismaOtpRepository implements OtpRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: CreateOtpInput): Promise<Otp> {
    return this.prisma.otp.create({
      data: {
        email: input.email,
        purpose: input.purpose,
        codeHash: input.codeHash,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        maxAttempts: 5
      }
    });
  }

  findActiveByToken(tokenHash: string): Promise<Otp | null> {
    return this.prisma.otp.findUnique({ where: { tokenHash } });
  }

  incrementAttempts(id: string): Promise<Otp> {
    return this.prisma.otp.update({ where: { id }, data: { attempts: { increment: 1 } } });
  }

  markVerified(id: string): Promise<Otp> {
    return this.prisma.otp.update({ where: { id }, data: { verifiedAt: new Date() } });
  }

  async revokeAllForEmail(email: string): Promise<Otp[]> {
    const tokens = await this.prisma.otp.findMany({ where: { email, verifiedAt: null } });
    await this.prisma.otp.updateMany({
      where: { email, verifiedAt: null },
      data: { verifiedAt: new Date(0) }
    });
    return tokens;
  }
}
