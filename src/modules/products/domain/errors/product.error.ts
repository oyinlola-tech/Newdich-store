import { NotFoundError, ConflictError } from '../../../../core/domain/errors/domain.error.js';

export class ProductNotFoundError extends NotFoundError {
  constructor() {
    super('PRODUCT_NOT_FOUND', 'Product not found.');
  }
}

export class ProductAlreadyExistsError extends ConflictError {
  constructor(message = 'A product with this name already exists.') {
    super('PRODUCT_ALREADY_EXISTS', message);
  }
}

export class InvalidProductError extends ConflictError {
  constructor(message: string) {
    super('INVALID_PRODUCT', message);
  }
}
