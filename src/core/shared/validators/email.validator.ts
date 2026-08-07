import { DomainError } from '../../domain/errors/domain.error.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function assertValidEmail(value: string): string {
  const email = value?.trim().toLowerCase();
  if (!isValidEmail(email)) {
    throw new DomainError('INVALID_EMAIL', 'Please enter a valid email address.');
  }
  return email;
}
