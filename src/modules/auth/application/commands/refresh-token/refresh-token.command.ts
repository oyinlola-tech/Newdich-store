import { Command } from '../../../../../core/application/commands/command.js';
import type { AuthService } from '../../services/auth.service.js';
import type { RefreshTokenDto } from '../../../../auth/presentation/dto/refresh-token.dto.js';

export class RefreshTokenCommand extends Command<Awaited<ReturnType<AuthService['refreshToken']>>> {
  constructor(readonly dto: RefreshTokenDto) {
    super();
  }
}
