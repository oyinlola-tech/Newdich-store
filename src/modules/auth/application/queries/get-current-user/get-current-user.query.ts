import { Query } from '../../../../../core/application/queries/query.js';
import type { UserService } from '../../../../users/application/services/user.service.js';

export class GetCurrentUserQuery extends Query<Awaited<ReturnType<UserService['getById']>>> {
  constructor(readonly userId: string) {
    super();
  }
}
