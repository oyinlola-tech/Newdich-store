import { Query } from '../../../../../core/application/queries/query.js';
import type { ProductService } from '../../services/product.service.js';
import type { ProductFilters } from '../../../domain/types/product.types.js';

export class SearchProductsQuery extends Query<Awaited<ReturnType<ProductService['list']>>> {
  constructor(readonly filters: ProductFilters) {
    super();
  }
}
