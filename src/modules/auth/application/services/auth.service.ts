import { OtpPurpose, type User } from '@prisma/client';
import type { AuthRepositoryPort } from '../ports/auth.repository.js';
import type { SessionRepositoryPort } from '../ports/session.repository.js';
import type { PasswordResetRepositoryPort } from '../ports/password-reset.repository.js';
import { OtpService } from './otp.service.js';
import type { TokenService, AccessTokenPayload } from '../../infrastructure/security/token.service.js';
import type { PasswordHasherService } from '../../infrastructure/security/password-hasher.service.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import type { AppLogger } from '../../../../core/infrastructure/logger/logger.service.js';
import { PasswordValueObject } from '../../domain/value-objects/password.value-object.js';
import { EmailValueObject } from '../../../../core/domain/value-objects/email.value-object.js';
import { RefreshTokenValueObject, hashToken } from '../../domain/value-objects/token.value-object.js';
import { generateSecretToken } from '../../../../core/shared/utils/id-generator.js';
import {
  AccountSuspendedError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  ResetTokenError,
  SessionRevokedError
} from '../../domain/errors/auth.error.js';
import { NotFoundError } from '../../../../core/domain/errors/domain.error.js';
import type { SessionOutput } from '../../domain/types/auth.types.js';

export interface RegisterResult {
  user: User;
  session?: SessionOutput;
  requiresOtp?: boolean;
  otpToken?: string;
}

export interface LoginResult {
  user: User;
  session?: SessionOutput;
  requiresOtp?: boolean;
  otpToken?: string;
}

export interface VerifyOtpResult {
  user: User;
  session?: SessionOutput;
  resetToken?: string;
}

export interface AuthServiceConfig {
  otpRequired: boolean;
  refreshTokenDays: number;
  publicBaseUrl: string;
}

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly passwordResetRepository: PasswordResetRepositoryPort,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly mailerService: MailerService,
    private readonly logger: AppLogger,
    private readonly config: AuthServiceConfig
  ) {}

  async register(input: { name: string; email: string; password: string }): Promise<RegisterResult> {
    const email = EmailValueObject.create(input.email).value;
    const existing = await this.authRepository.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyRegisteredError();
    }

    const password = PasswordValueObject.create(input.password).value;
    const passwordHash = await this.passwordHasher.hash(password);
    const user = await this.authRepository.create({
      name: input.name.trim(),
      email,
      passwordHash
    });

    if (this.config.otpRequired) {
      await this.otpService.revokeAllForEmail(email);
      const { otpToken } = await this.otpService.request(email, OtpPurpose.REGISTER, user.name);
      return { user, requiresOtp: true, otpToken };
    }

    const session = await this.createSession(user);
    await this.authRepository.markEmailVerified(user.id);
    await this.mailerService.sendWelcome({ email: user.email, name: user.name });
    return { user, session };
  }

  async login(
    input: { email: string; password: string; ip?: string; userAgent?: string },
    isAdmin: boolean
  ): Promise<LoginResult> {
    const email = EmailValueObject.create(input.email).value;
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      await this.logLogin({ email, ip: input.ip, userAgent: input.userAgent, success: false });
      throw new InvalidCredentialsError();
    }

    if (isAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      await this.logLogin({ email, ip: input.ip, userAgent: input.userAgent, success: false });
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      await this.logLogin({ email, ip: input.ip, userAgent: input.userAgent, success: false });
      throw new InvalidCredentialsError();
    }

    if (user.status !== 'ACTIVE') {
      await this.logLogin({
        userId: user.id,
        email,
        role: user.role,
        ip: input.ip,
        userAgent: input.userAgent,
        success: false
      });
      throw new AccountSuspendedError();
    }

    if (this.config.otpRequired) {
      await this.logLogin({
        userId: user.id,
        email,
        role: user.role,
        ip: input.ip,
        userAgent: input.userAgent,
        success: true
      });
      await this.otpService.revokeAllForEmail(email);
      const purpose = isAdmin ? OtpPurpose.ADMIN_LOGIN : OtpPurpose.LOGIN;
      const { otpToken } = await this.otpService.request(email, purpose, user.name);
      return { user, requiresOtp: true, otpToken };
    }

    await this.logLogin({
      userId: user.id,
      email,
      role: user.role,
      ip: input.ip,
      userAgent: input.userAgent,
      success: true
    });
    const session = await this.createSession(user);
    await this.sendLoginAlert(user, input.ip, input.userAgent);
    return { user, session };
  }

  private async logLogin(input: {
    userId?: string | null;
    email: string;
    role?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    success: boolean;
  }): Promise<void> {
    try {
      await this.authRepository.logLogin(input);
    } catch (error) {
      this.logger.error({ error, email: input.email }, 'failed to log login attempt');
    }
  }

  async verifyOtpAndComplete(input: {
    email: string;
    code: string;
    purpose: string;
    otpToken: string;
    ip?: string;
    userAgent?: string;
  }): Promise<VerifyOtpResult> {
    const purpose = OtpPurpose[input.purpose as keyof typeof OtpPurpose];
    if (!purpose) {
      throw new ResetTokenError('INVALID_PURPOSE', 'Invalid OTP purpose.');
    }

    const context = await this.otpService.verify({
      email: input.email,
      code: input.code,
      purpose,
      otpToken: input.otpToken
    });

    if (purpose === OtpPurpose.RESET_PASSWORD) {
      const resetToken = generateSecretToken();
      await this.passwordResetRepository.create({
        email: context.email,
        tokenHash: hashToken(resetToken),
        expiresAt: new Date(Date.now() + 60 * 60_000)
      });
      return { user: null as unknown as User, resetToken };
    }

    const user = await this.authRepository.findByEmail(context.email);
    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND', 'Account not found.');
    }
    if (user.status !== 'ACTIVE') {
      throw new AccountSuspendedError();
    }

    if (purpose === OtpPurpose.REGISTER) {
      await this.authRepository.markEmailVerified(user.id);
      await this.mailerService.sendWelcome({ email: user.email, name: user.name });
    } else {
      await this.logLogin({
        userId: user.id,
        email: user.email,
        role: user.role,
        ip: input.ip,
        userAgent: input.userAgent,
        success: true
      });
      await this.sendLoginAlert(user, input.ip, input.userAgent);
    }

    const session = await this.createSession(user);
    return { user, session };
  }

  async forgotPassword(emailInput: string): Promise<void> {
    const email = EmailValueObject.create(emailInput).value;
    const user = await this.authRepository.findByEmail(email);

    if (user) {
      const resetToken = generateSecretToken();
      await this.passwordResetRepository.create({
        email,
        tokenHash: hashToken(resetToken),
        expiresAt: new Date(Date.now() + 60 * 60_000)
      });
      const resetUrl = `${this.config.publicBaseUrl}/reset-password?token=${resetToken}`;
      await this.mailerService.sendPasswordReset({ email: user.email, name: user.name }, resetUrl);
      this.logger.debug({ email, resetUrl }, 'password reset link generated');
    }
  }

  async resetPassword(input: { token: string; password: string }): Promise<void> {
    const record = await this.passwordResetRepository.findByTokenHash(hashToken(input.token));
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new ResetTokenError('INVALID_RESET_TOKEN', 'This reset link is invalid or has expired. Please request a new one.');
    }

    const password = PasswordValueObject.create(input.password).value;
    const passwordHash = await this.passwordHasher.hash(password);
    await this.authRepository.updatePassword(record.email, passwordHash);
    await this.passwordResetRepository.markUsed(record.id);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND', 'Account not found.');
    }

    const passwordMatches = await this.passwordHasher.compare(currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError('Current password is incorrect.');
    }

    const password = PasswordValueObject.create(newPassword).value;
    const passwordHash = await this.passwordHasher.hash(password);
    await this.authRepository.updatePassword(userId, passwordHash);
    await this.sessionRepository.revokeAllForUser(userId);
    await this.mailerService.sendPasswordChanged({ email: user.email, name: user.name });
  }

  async refreshToken(refreshToken: string): Promise<{ user: User; session: SessionOutput }> {
    const session = await this.sessionRepository.findByRefreshTokenHash(hashToken(refreshToken));
    if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
      throw new SessionRevokedError();
    }

    const user = await this.authRepository.findById(session.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new SessionRevokedError();
    }

    return { user, session: this.createSessionResult(user, refreshToken) };
  }

  async logout(userId: string): Promise<void> {
    await this.sessionRepository.revokeAllForUser(userId);
  }

  private async sendLoginAlert(user: User, ip?: string, userAgent?: string): Promise<void> {
    try {
      await this.mailerService.sendLoginAlert({ email: user.email, name: user.name }, {
        ip: ip ?? 'Unknown',
        userAgent: userAgent ?? 'Unknown device',
        location: 'Unknown location'
      });
    } catch (error) {
      this.logger.error({ error, userId: user.id }, 'failed to send login alert');
    }
  }

  private async createSession(user: User): Promise<SessionOutput> {
    const refreshToken = RefreshTokenValueObject.generate();
    const expiresAt = new Date(Date.now() + this.config.refreshTokenDays * 24 * 60 * 60_000);

    await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash: refreshToken.tokenHash,
      expiresAt
    });
    await this.authRepository.markLastLogin(user.id);

    return this.createSessionResult(user, refreshToken.rawToken);
  }

  private createSessionResult(user: User, refreshToken: string): SessionOutput {
    const payload: AccessTokenPayload = {
      sub: user.id,
      role: user.role,
      type: 'access',
      email: user.email,
      status: user.status
    };
    return {
      accessToken: this.tokenService.sign(payload),
      refreshToken
    };
  }
}
