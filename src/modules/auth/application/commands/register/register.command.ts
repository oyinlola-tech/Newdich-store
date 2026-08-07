import { Command } from '../../../../../core/application/commands/command.js';
import type { RegisterResult } from '../../services/auth.service.js';
import type { RegisterDto } from '../../../../auth/presentation/dto/register.dto.js';

export class RegisterCommand extends Command<RegisterResult> {
  constructor(readonly dto: RegisterDto) {
    super();
  }
}
