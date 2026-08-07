import { NotFoundError } from '../../../../core/domain/errors/domain.error.js';

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('USER_NOT_FOUND', 'User not found.');
  }
}
