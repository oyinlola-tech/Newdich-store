import { NotFoundError, ConflictError } from '../../../../core/domain/errors/domain.error.js';

export class CategoryNotFoundError extends NotFoundError {
  constructor() {
    super('CATEGORY_NOT_FOUND', 'Category not found.');
  }
}

export class CategoryAlreadyExistsError extends ConflictError {
  constructor() {
    super('CATEGORY_ALREADY_EXISTS', 'A category with this name already exists.');
  }
}

export class CategoryHasProductsError extends ConflictError {
  constructor() {
    super('CATEGORY_HAS_PRODUCTS', 'Category cannot be deleted because it still has products linked to it.');
  }
}
