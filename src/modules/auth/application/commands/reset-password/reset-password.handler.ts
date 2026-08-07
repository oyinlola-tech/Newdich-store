import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { ResetPasswordCommand } from './reset-password.command.js';
import type { AuthService } from '../../services/auth.service.js';

export class ResetPasswordHandler implements CommandHandler<ResetPasswordCommand, void> {
  readonly commandName = ResetPasswordCommand.name;

  constructor(private readonly authService: AuthService) {}

  handle(command: ResetPasswordCommand): Promise<void> {
    return this.authService.resetPassword(command.dto);
  }
}
