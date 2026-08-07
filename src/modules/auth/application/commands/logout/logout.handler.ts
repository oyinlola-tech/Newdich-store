import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { LogoutCommand } from './logout.command.js';
import type { AuthService } from '../../services/auth.service.js';

export class LogoutHandler implements CommandHandler<LogoutCommand, void> {
  readonly commandName = LogoutCommand.name;

  constructor(private readonly authService: AuthService) {}

  handle(command: LogoutCommand): Promise<void> {
    return this.authService.logout(command.userId);
  }
}
