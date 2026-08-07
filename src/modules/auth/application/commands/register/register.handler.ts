import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { RegisterCommand } from './register.command.js';
import type { AuthService, RegisterResult } from '../../services/auth.service.js';

export class RegisterHandler implements CommandHandler<RegisterCommand, RegisterResult> {
  readonly commandName = RegisterCommand.name;

  constructor(private readonly authService: AuthService) {}

  handle(command: RegisterCommand): Promise<RegisterResult> {
    return this.authService.register(command.dto);
  }
}
