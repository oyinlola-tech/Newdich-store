import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain.error.js';

export class UuidValueObject {
  private constructor(readonly value: string) {}

  static generate(): UuidValueObject {
    return new UuidValueObject(randomUUID());
  }

  static create(raw: string): UuidValueObject {
    if (!raw || !UUID_PATTERN.test(raw)) {
      throw new DomainError('INVALID_UUID', 'Invalid identifier.');
    }
    return new UuidValueObject(raw);
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
