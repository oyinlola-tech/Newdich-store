import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { SearchProductsQuery } from './search-products.query.js';
import type { ProductService } from '../../services/product.service.js';

export class SearchProductsHandler implements QueryHandler<SearchProductsQuery, unknown> {
  readonly queryName = SearchProductsQuery.name;

  constructor(private readonly productService: ProductService) {}

  handle(query: SearchProductsQuery) {
    return this.productService.list(query.filters);
  }
}
