import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { AdminUpdateUserCommand } from './admin-update-user.command.js';
import type { UserService } from '../../services/user.service.js';
import type { User } from '@prisma/client';

export class AdminUpdateUserHandler implements CommandHandler<AdminUpdateUserCommand, User> {
  readonly commandName = AdminUpdateUserCommand.name;

  constructor(private readonly userService: UserService) {}

  handle(command: AdminUpdateUserCommand): Promise<User> {
    return this.userService.adminUpdate(command.userId, command.dto);
  }
}
