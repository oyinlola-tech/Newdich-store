import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { DeactivateAccountCommand } from './deactivate-account.command.js';
import type { UserService } from '../../services/user.service.js';
import type { User } from '@prisma/client';

export class DeactivateAccountHandler implements CommandHandler<DeactivateAccountCommand, User> {
  readonly commandName = DeactivateAccountCommand.name;

  constructor(private readonly userService: UserService) {}

  handle(command: DeactivateAccountCommand): Promise<User> {
    return this.userService.deactivateAccount(command.userId);
  }
}
