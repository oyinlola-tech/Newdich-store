import { Query } from '../../../../../core/application/queries/query.js';
import type { CategoryService } from '../../services/category.service.js';

export class GetCategoriesQuery extends Query<Awaited<ReturnType<CategoryService['listPublic']>>> {
  constructor(readonly includeInactive = false) {
    super();
  }
}
