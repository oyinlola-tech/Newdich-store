import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { GetUserQuery } from './get-user.query.js';
import type { UserService } from '../../services/user.service.js';
import type { User } from '@prisma/client';

export class GetUserHandler implements QueryHandler<GetUserQuery, User> {
  readonly queryName = GetUserQuery.name;

  constructor(private readonly userService: UserService) {}

  handle(query: GetUserQuery): Promise<User> {
    return this.userService.getById(query.userId);
  }
}
