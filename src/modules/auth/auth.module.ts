import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaAuthRepository } from './infrastructure/repositories/prisma-auth.repository.js';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository.js';
import { PrismaOtpRepository } from './infrastructure/repositories/prisma-otp.repository.js';
import { PrismaPasswordResetRepository } from './infrastructure/repositories/prisma-password-reset.repository.js';
import { OtpService } from './application/services/otp.service.js';
import { AuthService } from './application/services/auth.service.js';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { registerAuthRoutes } from './presentation/routes/auth.route.js';
import { registerAdminAuthRoutes } from './presentation/routes/admin-auth.route.js';
import { appConfig, authConfig } from '../../config/index.js';
import type { AuthRepositoryPort } from './application/ports/auth.repository.js';
import type { NewsletterService } from '../newsletters/application/services/newsletter.service.js';
import { CommandBus } from '../../core/application/commands/command-bus.js';
import { QueryBus } from '../../core/application/queries/query-bus.js';
import { RegisterHandler } from './application/commands/register/register.handler.js';
import { LoginHandler } from './application/commands/login/login.handler.js';
import { LogoutHandler } from './application/commands/logout/logout.handler.js';
import { RefreshTokenHandler } from './application/commands/refresh-token/refresh-token.handler.js';
import { RequestOtpHandler } from './application/commands/request-otp/request-otp.handler.js';
import { VerifyOtpHandler } from './application/commands/verify-otp/verify-otp.handler.js';
import { ForgotPasswordHandler } from './application/commands/forgot-password/forgot-password.handler.js';
import { ResetPasswordHandler } from './application/commands/reset-password/reset-password.handler.js';
import { ChangePasswordHandler } from './application/commands/change-password/change-password.handler.js';
import { GetCurrentUserHandler } from './application/queries/get-current-user/get-current-user.handler.js';

export function registerAuthModule(container: Container, app: FastifyInstance): void {
  container.register('auth.repository', (c) => new PrismaAuthRepository(c.get('prisma')));
  container.register('session.repository', (c) => new PrismaSessionRepository(c.get('prisma')));
  container.register('otp.repository', (c) => new PrismaOtpRepository(c.get('prisma')));
  container.register('password-reset.repository', (c) => new PrismaPasswordResetRepository(c.get('prisma')));
  container.register('otp.service', (c) =>
    new OtpService(
      c.get('otp.repository'),
      c.get('mailer.service'),
      authConfig.OTP_LIFETIME_MINUTES
    )
  );
  container.register('auth.service', (c) =>
    new AuthService(
      c.get('auth.repository'),
      c.get('session.repository'),
      c.get('password-reset.repository'),
      c.get('otp.service'),
      c.get('token.service'),
      c.get('password-hasher.service'),
      c.get('mailer.service'),
      container.has('newsletter.service') ? c.get<NewsletterService>('newsletter.service') : null,
      c.get('logger'),
      {
        otpRequired: authConfig.OTP_REQUIRED,
        refreshTokenDays: authConfig.REFRESH_TOKEN_DAYS,
        publicBaseUrl: appConfig.PUBLIC_BASE_URL
      }
    )
  );
  container.register('auth.controller', (c) => new AuthController(c.get('command.bus'), c.get('query.bus')));

  const commandBus = container.get<CommandBus>('command.bus');
  const queryBus = container.get<QueryBus>('query.bus');
  const authService = container.get<AuthService>('auth.service');
  const otpService = container.get<OtpService>('otp.service');
  const authRepository = container.get<AuthRepositoryPort>('auth.repository');

  commandBus
    .register(new RegisterHandler(authService))
    .register(new LoginHandler(authService))
    .register(new LogoutHandler(authService))
    .register(new RefreshTokenHandler(authService))
    .register(new RequestOtpHandler(otpService))
    .register(new VerifyOtpHandler(authService))
    .register(new ForgotPasswordHandler(authService))
    .register(new ResetPasswordHandler(authService))
    .register(new ChangePasswordHandler(authService));

  queryBus.register(new GetCurrentUserHandler(authRepository));

  registerAuthRoutes(app, container);
  registerAdminAuthRoutes(app, container);
}
