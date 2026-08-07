import type { QueryHandler } from '../../../../../core/application/queries/query.js';
import { GetProductQuery } from './get-product.query.js';
import type { ProductService } from '../../services/product.service.js';
import type { ProductWithRelations } from '../../../domain/types/product.types.js';

export class GetProductHandler implements QueryHandler<GetProductQuery, ProductWithRelations> {
  readonly queryName = GetProductQuery.name;

  constructor(private readonly productService: ProductService) {}

  handle(query: GetProductQuery): Promise<ProductWithRelations> {
    return query.idOrSlug.includes('-')
      ? this.productService.getBySlug(query.idOrSlug)
      : this.productService.getById(query.idOrSlug);
  }
}
