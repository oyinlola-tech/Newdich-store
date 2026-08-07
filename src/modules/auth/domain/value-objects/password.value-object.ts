import { DomainError } from '../../../../core/domain/errors/domain.error.js';

export class PasswordValueObject {
  private constructor(readonly value: string) {}

  static create(raw: string): PasswordValueObject {
    if (!raw || raw.length < 6) {
      throw new DomainError('WEAK_PASSWORD', 'Password must be at least 6 characters long.');
    }
    if (raw.length > 72) {
      throw new DomainError('WEAK_PASSWORD', 'Password must be at most 72 characters long.');
    }
    return new PasswordValueObject(raw);
  }
}
