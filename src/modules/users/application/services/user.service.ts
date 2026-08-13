import { UserRole, UserStatus, type User } from '@prisma/client';
import type { UserRepositoryPort, UserListFilters } from '../ports/user.repository.js';
import { UserNotFoundError } from '../../domain/errors/user.error.js';
import { EmailValueObject } from '../../../../core/domain/value-objects/email.value-object.js';
import type { UpdateProfileDto, AdminUpdateUserDto } from '../../presentation/dto/index.js';
import { ConflictError } from '../../../../core/domain/errors/domain.error.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';

export class UserService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService
  ) {}

  async getById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const patch: { name?: string; email?: string; phone?: string | null; birthday?: Date | null } = {};

    if (dto.name !== undefined) {
      patch.name = dto.name;
    }
    if (dto.phone !== undefined) {
      patch.phone = dto.phone;
    }
    if (dto.birthday !== undefined) {
      patch.birthday = dto.birthday ? new Date(dto.birthday) : null;
    }
    if (dto.email !== undefined) {
      const email = EmailValueObject.create(dto.email).value;
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.id !== userId) {
        throw new ConflictError('EMAIL_ALREADY_REGISTERED', 'This email is already in use.');
      }
      patch.email = email;
    }

    if (Object.keys(patch).length === 0) {
      return this.getById(userId);
    }

    return this.userRepository.update(userId, patch);
  }

  async adminList(filters: UserListFilters) {
    return this.userRepository.list(filters);
  }

  async adminUpdate(userId: string, dto: AdminUpdateUserDto): Promise<User> {
    const patch: { role?: UserRole; status?: UserStatus } = {};

    if (dto.role !== undefined) {
      patch.role = dto.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER;
    }
    if (dto.status !== undefined) {
      patch.status = dto.status === 'active' ? UserStatus.ACTIVE : UserStatus.SUSPENDED;
    }

    if (Object.keys(patch).length === 0) {
      return this.getById(userId);
    }

    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new UserNotFoundError();
    }

    if (patch.status === UserStatus.SUSPENDED) {
      await this.mailerService.sendAccountSuspended(
        { email: existing.email, name: existing.name },
        'Your account was suspended by an administrator. Contact support if you believe this is a mistake.'
      );
    }

    return this.userRepository.update(userId, patch);
  }

  async deactivateAccount(userId: string): Promise<User> {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new UserNotFoundError();
    }
    const user = await this.userRepository.update(userId, { status: UserStatus.SUSPENDED });
    await this.mailerService.sendAccountSuspended(
      { email: existing.email, name: existing.name },
      'Your account has been deactivated. You can reactivate it by logging in again.'
    );
    return user;
  }

  async deleteAccount(userId: string): Promise<void> {
    const existing = await this.userRepository.findById(userId);
    if (!existing) {
      throw new UserNotFoundError();
    }
    await this.userRepository.update(userId, { status: UserStatus.SUSPENDED });
  }
}
