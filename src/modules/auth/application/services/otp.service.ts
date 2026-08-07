import { createHash, randomBytes } from 'node:crypto';
import type { OtpPurpose } from '@prisma/client';
import type { OtpRepositoryPort } from '../ports/otp.repository.js';
import { OtpValueObject } from '../../domain/value-objects/otp.value-object.js';
import { OtpError } from '../../domain/errors/auth.error.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';

export interface RequestOtpResult {
  otpToken: string;
  expiresInSeconds: number;
}

export interface VerifyOtpContext {
  purpose: OtpPurpose;
  email: string;
}

export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepositoryPort,
    private readonly mailerService: MailerService,
    private readonly lifetimeMinutes: number
  ) {}

  async request(email: string, purpose: OtpPurpose, name?: string): Promise<RequestOtpResult> {
    const otp = OtpValueObject.generate(this.lifetimeMinutes);
    const token = randomBytes(24).toString('hex');

    await this.otpRepository.create({
      email,
      purpose,
      codeHash: hashCode(otp.code),
      tokenHash: createHash('sha256').update(token).digest('hex'),
      expiresAt: otp.expiresAt
    });

    await this.sendOtpEmail(email, otp.code, purpose, name);

    return {
      otpToken: token,
      expiresInSeconds: this.lifetimeMinutes * 60
    };
  }

  async verify(input: {
    email: string;
    code: string;
    purpose: OtpPurpose;
    otpToken: string;
  }): Promise<VerifyOtpContext> {
    const record = await this.otpRepository.findActiveByToken(
      createHash('sha256').update(input.otpToken).digest('hex')
    );

    if (!record || record.email !== input.email || record.purpose !== input.purpose) {
      throw new OtpError('INVALID_OTP', 'Invalid or expired verification token. Please request a new code.');
    }

    if (record.verifiedAt) {
      throw new OtpError('OTP_ALREADY_USED', 'This code has already been used.');
    }

    OtpValueObject.assertNotExpired(record.expiresAt);

    if (record.attempts >= record.maxAttempts) {
      throw new OtpError('TOO_MANY_ATTEMPTS', 'Too many incorrect attempts. Please request a new code.');
    }

    if (hashCode(input.code) !== record.codeHash) {
      await this.otpRepository.incrementAttempts(record.id);
      throw new OtpError('INVALID_OTP', 'Incorrect verification code. Please try again.');
    }

    await this.otpRepository.markVerified(record.id);

    return { purpose: record.purpose, email: record.email };
  }

  async revokeAllForEmail(email: string): Promise<void> {
    await this.otpRepository.revokeAllForEmail(email);
  }

  private async sendOtpEmail(email: string, code: string, purpose: OtpPurpose, name?: string): Promise<void> {
    const purposeLabel =
      purpose === 'LOGIN'
        ? 'login'
        : purpose === 'REGISTER'
          ? 'register'
          : purpose === 'ADMIN_LOGIN'
            ? 'admin-login'
            : 'reset-password';

    await this.mailerService.sendOtp(
      { email, name: name ?? email.split('@')[0] },
      code,
      this.lifetimeMinutes,
      purposeLabel
    );
  }
}

export function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}
