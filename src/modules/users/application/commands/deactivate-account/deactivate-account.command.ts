import { Command } from '../../../../../core/application/commands/command.js';
import type { UserService } from '../../services/user.service.js';

export class DeactivateAccountCommand extends Command<Awaited<ReturnType<UserService['deactivateAccount']>>> {
  constructor(readonly userId: string) {
    super();
  }
}
