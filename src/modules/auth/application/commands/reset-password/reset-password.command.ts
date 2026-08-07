import { Command } from '../../../../../core/application/commands/command.js';
import type { ResetPasswordDto } from '../../../../auth/presentation/dto/password.dto.js';

export class ResetPasswordCommand extends Command<void> {
  constructor(readonly dto: ResetPasswordDto) {
    super();
  }
}
