import { DomainError } from '../../../../core/domain/errors/domain.error.js';

export class SkuValueObject {
  private constructor(readonly value: string) {}

  static create(raw: string | null | undefined): SkuValueObject | null {
    if (!raw) {
      return null;
    }
    const value = raw.trim().toUpperCase();
    if (!value || value.length > 50) {
      throw new DomainError('INVALID_SKU', 'SKU must be 50 characters or fewer.');
    }
    return new SkuValueObject(value);
  }
}
