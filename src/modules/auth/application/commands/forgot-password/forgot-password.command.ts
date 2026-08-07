import { Command } from '../../../../../core/application/commands/command.js';
import type { ForgotPasswordDto } from '../../../../auth/presentation/dto/password.dto.js';

export class ForgotPasswordCommand extends Command<void> {
  constructor(readonly dto: ForgotPasswordDto) {
    super();
  }
}
