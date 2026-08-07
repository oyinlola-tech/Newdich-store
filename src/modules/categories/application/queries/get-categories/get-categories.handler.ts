import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { GetCategoriesQuery } from './get-categories.query.js';
import type { CategoryService } from '../../services/category.service.js';
import type { Category } from '@prisma/client';

export class GetCategoriesHandler implements QueryHandler<GetCategoriesQuery, Category[]> {
  readonly queryName = GetCategoriesQuery.name;

  constructor(private readonly categoryService: CategoryService) {}

  handle(query: GetCategoriesQuery): Promise<Category[]> {
    return query.includeInactive
      ? this.categoryService.listAdmin()
      : this.categoryService.listPublic();
  }
}
