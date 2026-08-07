import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { GetProductsQuery } from './get-products.query.js';
import type { ProductService } from '../../services/product.service.js';

export class GetProductsHandler implements QueryHandler<GetProductsQuery, unknown> {
  readonly queryName = GetProductsQuery.name;

  constructor(private readonly productService: ProductService) {}

  handle(query: GetProductsQuery) {
    return this.productService.list(query.filters);
  }
}
