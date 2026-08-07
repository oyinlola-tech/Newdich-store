import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { GetCurrentUserQuery } from './get-current-user.query.js';
import type { AuthRepositoryPort } from '../../ports/auth.repository.js';
import { NotFoundError } from '../../../../../core/domain/errors/domain.error.js';
import type { User } from '@prisma/client';

export class GetCurrentUserHandler implements QueryHandler<GetCurrentUserQuery, User> {
  readonly queryName = GetCurrentUserQuery.name;

  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async handle(query: GetCurrentUserQuery): Promise<User> {
    const user = await this.authRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND', 'User not found.');
    }
    return user;
  }
}
