import type { ProductStatus } from '@prisma/client';

export interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  status: ProductStatus;
  featured: boolean;
  createdAt: Date;
  categoryId: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
  images: string[];
  stock: number;
  lowStockThreshold: number;
}

export interface ProductFilters {
  featured?: boolean;
  categoryId?: string;
  brandId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  discounted?: boolean;
  discountAll?: boolean;
  discountProductIds?: string[];
  discountBrandIds?: string[];
  discountCategoryIds?: string[];
  status?: ProductStatus;
  sort?: 'price_asc' | 'price_desc' | 'featured' | 'newest';
  page: number;
  limit: number;
}

export interface ProductListResult {
  products: ProductWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductData {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  status?: ProductStatus;
  featured?: boolean;
  categoryId?: string | null;
  categoryName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  images: string[];
  stock: number;
  lowStockThreshold?: number;
}

export interface UpdateProductData {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  status?: ProductStatus;
  featured?: boolean;
  categoryId?: string | null;
  categoryName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  images?: string[];
  stock?: number;
}
