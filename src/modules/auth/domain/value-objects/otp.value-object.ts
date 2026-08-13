import { randomInt } from 'node:crypto';
import { OtpPurpose } from '@prisma/client';
import { OtpError } from '../errors/auth.error.js';

export type OtpPurposeInput = 'login' | 'register' | 'reset' | 'admin_login';

export class OtpValueObject {
  private constructor(
    readonly code: string,
    readonly expiresAt: Date
  ) {}

  static generate(lifetimeMinutes: number): OtpValueObject {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + lifetimeMinutes * 60_000);
    return new OtpValueObject(code, expiresAt);
  }

  static purposeFromInput(purpose: OtpPurposeInput): OtpPurpose {
    switch (purpose) {
      case 'login':
        return OtpPurpose.LOGIN;
      case 'register':
        return OtpPurpose.REGISTER;
      case 'reset':
        return OtpPurpose.RESET_PASSWORD;
      case 'admin_login':
        return OtpPurpose.ADMIN_LOGIN;
    }
  }

  static assertNotExpired(expiresAt: Date): void {
    if (expiresAt.getTime() < Date.now()) {
      throw new OtpError('OTP_EXPIRED', 'This verification code has expired. Please request a new one.');
    }
  }
}
