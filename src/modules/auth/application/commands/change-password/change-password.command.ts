import { Command } from '../../../../../core/application/commands/command.js';
import type { ChangePasswordDto } from '../../../../auth/presentation/dto/password.dto.js';

export class ChangePasswordCommand extends Command<void> {
  constructor(readonly userId: string, readonly dto: ChangePasswordDto) {
    super();
  }
}
