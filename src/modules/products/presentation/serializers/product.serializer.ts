import type { ProductWithRelations } from '../../domain/types/product.types.js';

export interface ProductOutput {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  image: string | null;
  images: string[];
  category: string | null;
  categoryId: string | null;
  stock: number;
  createdAt: Date;
}

export function toProductOutput(product: ProductWithRelations): ProductOutput {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    sku: product.sku,
    status: product.status.toLowerCase() as 'active' | 'draft' | 'archived',
    featured: product.featured,
    image: product.images[0] ?? null,
    images: product.images,
    category: product.categoryName,
    categoryId: product.categoryId,
    stock: product.stock,
    createdAt: product.createdAt
  };
}
