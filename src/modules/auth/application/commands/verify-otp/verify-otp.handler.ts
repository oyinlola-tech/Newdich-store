import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { VerifyOtpCommand } from './verify-otp.command.js';
import type { AuthService, VerifyOtpResult } from '../../services/auth.service.js';

export class VerifyOtpHandler implements CommandHandler<VerifyOtpCommand, VerifyOtpResult> {
  readonly commandName = VerifyOtpCommand.name;

  constructor(private readonly authService: AuthService) {}

  handle(command: VerifyOtpCommand): Promise<VerifyOtpResult> {
    return this.authService.verifyOtpAndComplete({
      ...command.dto,
      ip: command.ip,
      userAgent: command.userAgent
    });
  }
}
