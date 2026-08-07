import { Query } from '../../../../../core/application/queries/query.js';
import type { CategoryService } from '../../services/category.service.js';

export class GetCategoryQuery extends Query<Awaited<ReturnType<CategoryService['getByIdOrSlug']>>> {
  constructor(readonly idOrSlug: string) {
    super();
  }
}
