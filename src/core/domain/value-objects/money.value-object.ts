import { DomainError } from '../errors/domain.error.js';

export class MoneyValueObject {
  private constructor(readonly amount: number, readonly currency: string) {}

  static create(amount: number, currency = 'NGN'): MoneyValueObject {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new DomainError('INVALID_MONEY', 'Amount must be a positive finite number.');
    }
    const rounded = Math.round(amount * 100) / 100;
    return new MoneyValueObject(rounded, currency);
  }

  add(other: MoneyValueObject): MoneyValueObject {
    if (this.currency !== other.currency) {
      throw new DomainError('INVALID_MONEY', 'Cannot add amounts in different currencies.');
    }
    return MoneyValueObject.create(this.amount + other.amount, this.currency);
  }

  subtract(other: MoneyValueObject): MoneyValueObject {
    if (this.currency !== other.currency) {
      throw new DomainError('INVALID_MONEY', 'Cannot subtract amounts in different currencies.');
    }
    return MoneyValueObject.create(Math.max(0, this.amount - other.amount), this.currency);
  }

  multiply(factor: number): MoneyValueObject {
    return MoneyValueObject.create(this.amount * factor, this.currency);
  }
}
