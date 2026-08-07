import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { RefreshTokenCommand } from './refresh-token.command.js';
import type { AuthService } from '../../services/auth.service.js';

export class RefreshTokenHandler implements CommandHandler<RefreshTokenCommand, unknown> {
  readonly commandName = RefreshTokenCommand.name;

  constructor(private readonly authService: AuthService) {}

  handle(command: RefreshTokenCommand) {
    return this.authService.refreshToken(command.dto.refreshToken);
  }
}
