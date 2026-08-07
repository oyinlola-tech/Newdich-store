import type { FastifyReply, FastifyRequest } from 'fastify';
import { CommandBus } from '../../../../core/application/commands/command-bus.js';
import { QueryBus } from '../../../../core/application/queries/query-bus.js';
import { parseBody } from '../../../../core/infrastructure/http/parse.js';
import { registerValidator } from '../validators/register.validator.js';
import { loginValidator } from '../validators/login.validator.js';
import { requestOtpValidator, verifyOtpValidator } from '../validators/otp.validator.js';
import { forgotPasswordValidator, resetPasswordValidator, changePasswordValidator } from '../validators/password.validator.js';
import { refreshTokenValidator } from '../validators/refresh-token.validator.js';
import { RegisterCommand } from '../../application/commands/register/register.command.js';
import { LoginCommand } from '../../application/commands/login/login.command.js';
import { RequestOtpCommand } from '../../application/commands/request-otp/request-otp.command.js';
import { VerifyOtpCommand } from '../../application/commands/verify-otp/verify-otp.command.js';
import { ForgotPasswordCommand } from '../../application/commands/forgot-password/forgot-password.command.js';
import { ResetPasswordCommand } from '../../application/commands/reset-password/reset-password.command.js';
import { ChangePasswordCommand } from '../../application/commands/change-password/change-password.command.js';
import { RefreshTokenCommand } from '../../application/commands/refresh-token/refresh-token.command.js';
import { LogoutCommand } from '../../application/commands/logout/logout.command.js';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user/get-current-user.query.js';
import { toAdminOutput, toAuthUser } from '../serializers/auth.serializer.js';

export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(registerValidator, request.body);
    const result = await this.commandBus.execute(new RegisterCommand(dto));

    if (result.requiresOtp) {
      return reply.status(201).send({
        requiresOtp: true,
        otpToken: result.otpToken,
        message: 'We sent a verification code to your email. Please verify your account.'
      });
    }

    return reply.status(201).send({
      token: result.session?.accessToken,
      refreshToken: result.session?.refreshToken,
      user: toAuthUser(result.user)
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(loginValidator, request.body);
    const result = await this.commandBus.execute(
      new LoginCommand(dto, false, request.ip, request.headers['user-agent'])
    );

    if (result.requiresOtp) {
      return reply.send({
        requiresOtp: true,
        otpToken: result.otpToken,
        message: 'Enter the verification code sent to your email to continue.'
      });
    }

    return reply.send({
      token: result.session?.accessToken,
      refreshToken: result.session?.refreshToken,
      user: toAuthUser(result.user)
    });
  }

  async requestOtp(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(requestOtpValidator, request.body);
    const result = await this.commandBus.execute(new RequestOtpCommand(dto));
    return reply.send({ ...result, message: 'Verification code sent to your email.' });
  }

  async verifyOtp(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(verifyOtpValidator, request.body);
    const result = await this.commandBus.execute(
      new VerifyOtpCommand(dto, request.ip, request.headers['user-agent'])
    );

    if (result.resetToken) {
      return reply.send({ resetToken: result.resetToken, message: 'Code verified. Enter your new password.' });
    }

    return reply.send({
      token: result.session?.accessToken,
      refreshToken: result.session?.refreshToken,
      user: toAuthUser(result.user)
    });
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(forgotPasswordValidator, request.body);
    await this.commandBus.execute(new ForgotPasswordCommand(dto));
    return reply.send({
      message: 'If an account exists for that email, a password reset link has been sent.'
    });
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(resetPasswordValidator, request.body);
    await this.commandBus.execute(new ResetPasswordCommand(dto));
    return reply.send({ message: 'Password updated successfully. You can now login with your new password.' });
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(changePasswordValidator, request.body);
    await this.commandBus.execute(new ChangePasswordCommand(request.user!.id, dto));
    return reply.send({ message: 'Password changed successfully. Please login again.' });
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(refreshTokenValidator, request.body);
    const result = await this.commandBus.execute(new RefreshTokenCommand(dto));
    return reply.send({
      token: result.session.accessToken,
      refreshToken: result.session.refreshToken,
      user: toAuthUser(result.user)
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    await this.commandBus.execute(new LogoutCommand(request.user!.id));
    return reply.send({ message: 'Logged out successfully.' });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.queryBus.execute(new GetCurrentUserQuery(request.user!.id));
    return reply.send({ user: toAuthUser(user) });
  }

  async adminLogin(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(loginValidator, request.body);
    const result = await this.commandBus.execute(
      new LoginCommand(dto, true, request.ip, request.headers['user-agent'])
    );

    if (result.requiresOtp) {
      return reply.send({
        requiresOtp: true,
        otpToken: result.otpToken,
        message: 'Enter the verification code sent to your email to continue.'
      });
    }

    return reply.send({
      token: result.session?.accessToken,
      refreshToken: result.session?.refreshToken,
      admin: toAdminOutput(result.user)
    });
  }

  async adminVerifyOtp(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(verifyOtpValidator, request.body);
    const result = await this.commandBus.execute(
      new VerifyOtpCommand({ ...dto, purpose: 'admin_login' }, request.ip, request.headers['user-agent'])
    );
    return reply.send({
      token: result.session?.accessToken,
      refreshToken: result.session?.refreshToken,
      admin: toAdminOutput(result.user)
    });
  }

  async adminMe(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.queryBus.execute(new GetCurrentUserQuery(request.user!.id));
    return reply.send({ admin: toAdminOutput(user) });
  }
}
