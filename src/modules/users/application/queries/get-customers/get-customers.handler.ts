import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { GetCustomersQuery } from './get-customers.query.js';
import type { UserService } from '../../services/user.service.js';
import type { User } from '@prisma/client';

export interface GetCustomersResult {
  users: User[];
  total: number;
}

export class GetCustomersHandler implements QueryHandler<GetCustomersQuery, GetCustomersResult> {
  readonly queryName = GetCustomersQuery.name;

  constructor(private readonly userService: UserService) {}

  handle(query: GetCustomersQuery): Promise<GetCustomersResult> {
    return this.userService.adminList(query.params);
  }
}
