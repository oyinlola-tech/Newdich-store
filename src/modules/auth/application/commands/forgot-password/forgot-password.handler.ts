import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { ForgotPasswordCommand } from './forgot-password.command.js';
import type { AuthService } from '../../services/auth.service.js';

export class ForgotPasswordHandler implements CommandHandler<ForgotPasswordCommand, void> {
  readonly commandName = ForgotPasswordCommand.name;

  constructor(private readonly authService: AuthService) {}

  handle(command: ForgotPasswordCommand): Promise<void> {
    return this.authService.forgotPassword(command.dto.email);
  }
}
