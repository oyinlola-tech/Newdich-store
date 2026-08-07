import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { ChangePasswordCommand } from './change-password.command.js';
import type { AuthService } from '../../services/auth.service.js';

export class ChangePasswordHandler implements CommandHandler<ChangePasswordCommand, void> {
  readonly commandName = ChangePasswordCommand.name;

  constructor(private readonly authService: AuthService) {}

  handle(command: ChangePasswordCommand): Promise<void> {
    return this.authService.changePassword(command.userId, command.dto.currentPassword, command.dto.newPassword);
  }
}
