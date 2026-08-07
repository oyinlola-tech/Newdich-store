import { DomainError } from '../errors/domain.error.js';

export class EmailValueObject {
  private constructor(readonly value: string) {}

  static create(raw: string): EmailValueObject {
    const normalized = raw?.trim().toLowerCase();
    if (!normalized || !EMAIL_PATTERN.test(normalized)) {
      throw new DomainError('INVALID_EMAIL', 'Please enter a valid email address.');
    }
    return new EmailValueObject(normalized);
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
