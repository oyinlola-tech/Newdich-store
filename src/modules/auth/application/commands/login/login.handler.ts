import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { LoginCommand } from './login.command.js';
import type { AuthService, LoginResult } from '../../services/auth.service.js';

export class LoginHandler implements CommandHandler<LoginCommand, LoginResult> {
  readonly commandName = LoginCommand.name;

  constructor(private readonly authService: AuthService) {}

  handle(command: LoginCommand): Promise<LoginResult> {
    return this.authService.login(
      { ...command.dto, ip: command.ip, userAgent: command.userAgent },
      command.isAdmin
    );
  }
}
