import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { UpdateProfileCommand } from './update-profile.command.js';
import type { UserService } from '../../services/user.service.js';
import type { User } from '@prisma/client';

export class UpdateProfileHandler implements CommandHandler<UpdateProfileCommand, User> {
  readonly commandName = UpdateProfileCommand.name;

  constructor(private readonly userService: UserService) {}

  handle(command: UpdateProfileCommand): Promise<User> {
    return this.userService.updateProfile(command.userId, command.dto);
  }
}
