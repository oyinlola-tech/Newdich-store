import { Query } from '../../../../../core/application/queries/query.js';
import type { ProductService } from '../../services/product.service.js';

export class GetProductQuery extends Query<Awaited<ReturnType<ProductService['getById']>>> {
  constructor(readonly idOrSlug: string) {
    super();
  }
}
