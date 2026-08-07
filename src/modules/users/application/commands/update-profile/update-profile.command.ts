import { Command } from '../../../../../core/application/commands/command.js';
import type { UserService } from '../../services/user.service.js';
import type { UpdateProfileDto } from '../../../presentation/dto/update-profile.dto.js';

export class UpdateProfileCommand extends Command<Awaited<ReturnType<UserService['updateProfile']>>> {
  constructor(readonly userId: string, readonly dto: UpdateProfileDto) {
    super();
  }
}
