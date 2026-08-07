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
