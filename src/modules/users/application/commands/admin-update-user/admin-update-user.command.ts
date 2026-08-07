import { Command } from '../../../../../core/application/commands/command.js';
import type { UserService } from '../../services/user.service.js';
import type { AdminUpdateUserDto } from '../../../presentation/dto/admin-user.dto.js';

export class AdminUpdateUserCommand extends Command<Awaited<ReturnType<UserService['adminUpdate']>>> {
  constructor(readonly userId: string, readonly dto: AdminUpdateUserDto) {
    super();
  }
}
