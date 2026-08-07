import { Query } from '../../../../../core/application/queries/query.js';
import type { UserService } from '../../services/user.service.js';

export interface GetCustomersQueryParams {
  search?: string;
  page: number;
  limit: number;
}

export class GetCustomersQuery extends Query<Awaited<ReturnType<UserService['adminList']>>> {
  constructor(readonly params: GetCustomersQueryParams) {
    super();
  }
}
