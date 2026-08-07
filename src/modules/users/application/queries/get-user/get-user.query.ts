import { Query } from '../../../../../core/application/queries/query.js';
import type { UserService } from '../../services/user.service.js';

export class GetUserQuery extends Query<Awaited<ReturnType<UserService['getById']>>> {
  constructor(readonly userId: string) {
    super();
  }
}
