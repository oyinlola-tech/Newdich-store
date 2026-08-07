import { DomainError } from '../../../../core/domain/errors/domain.error.js';

export class ProductPriceValueObject {
  private constructor(readonly value: number) {}

  static create(raw: number): ProductPriceValueObject {
    if (!Number.isFinite(raw) || raw < 0) {
      throw new DomainError('INVALID_PRICE', 'Product price must be a positive number.');
    }
    return new ProductPriceValueObject(Math.round(raw * 100) / 100);
  }
}
