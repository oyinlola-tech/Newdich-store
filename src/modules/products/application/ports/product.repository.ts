import type { ProductFilters, ProductListResult, ProductWithRelations, CreateProductData, UpdateProductData } from '../../domain/types/product.types.js';

export interface ProductRepositoryPort {
  findById(id: string): Promise<ProductWithRelations | null>;
  findBySlug(slug: string): Promise<ProductWithRelations | null>;
  list(filters: ProductFilters): Promise<ProductListResult>;
  create(input: CreateProductData): Promise<ProductWithRelations>;
  update(id: string, input: UpdateProductData): Promise<ProductWithRelations>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  countActive(): Promise<number>;
}
