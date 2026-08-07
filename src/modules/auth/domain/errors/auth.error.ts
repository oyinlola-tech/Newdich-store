import { DomainError, ConflictError, UnauthorizedError } from '../../../../core/domain/errors/domain.error.js';

export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message = 'Invalid email or password') {
    super(message, 'INVALID_CREDENTIALS');
  }
}

export class AccountSuspendedError extends UnauthorizedError {
  constructor(message = 'This account has been suspended. Contact support for help.') {
    super(message, 'ACCOUNT_SUSPENDED');
  }
}

export class EmailAlreadyRegisteredError extends ConflictError {
  constructor(message = 'An account with this email already exists. Please login instead.') {
    super('EMAIL_ALREADY_REGISTERED', message);
  }
}

export class OtpError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

export class ResetTokenError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

export class SessionRevokedError extends UnauthorizedError {
  constructor(message = 'Session has expired. Please login again.') {
    super(message, 'SESSION_EXPIRED');
  }
}
