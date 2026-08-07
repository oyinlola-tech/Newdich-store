import { Command } from '../../../../../core/application/commands/command.js';
import type { LoginResult } from '../../services/auth.service.js';
import type { LoginDto } from '../../../../auth/presentation/dto/login.dto.js';

export class LoginCommand extends Command<LoginResult> {
  constructor(
    readonly dto: LoginDto,
    readonly isAdmin = false,
    readonly ip?: string,
    readonly userAgent?: string
  ) {
    super();
  }
}
