import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { DeleteAccountCommand } from './delete-account.command.js';
import type { UserService } from '../../services/user.service.js';

export class DeleteAccountHandler implements CommandHandler<DeleteAccountCommand, void> {
  readonly commandName = DeleteAccountCommand.name;

  constructor(private readonly userService: UserService) {}

  handle(command: DeleteAccountCommand): Promise<void> {
    return this.userService.deleteAccount(command.userId);
  }
}
