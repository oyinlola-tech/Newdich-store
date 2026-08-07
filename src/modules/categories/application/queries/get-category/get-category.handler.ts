import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { GetCategoryQuery } from './get-category.query.js';
import type { CategoryService } from '../../services/category.service.js';
import type { Category } from '@prisma/client';

export class GetCategoryHandler implements QueryHandler<GetCategoryQuery, Category> {
  readonly queryName = GetCategoryQuery.name;

  constructor(private readonly categoryService: CategoryService) {}

  handle(query: GetCategoryQuery): Promise<Category> {
    return this.categoryService.getByIdOrSlug(query.idOrSlug);
  }
}
