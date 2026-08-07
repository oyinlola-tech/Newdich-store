import type { CategoryProduct, Inventory, Product, ProductImage } from '@prisma/client';
import type { ProductWithRelations } from '../../domain/types/product.types.js';

type ProductWithRelationsRow = Product & {
  categories: (CategoryProduct & { category: { id: string; name: string } })[];
  images: ProductImage[];
  inventory: Inventory | null;
  brand: { id: string; name: string } | null;
};

export function toProductWithRelations(row: ProductWithRelationsRow): ProductWithRelations {
  const inventory = row.inventory;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice === null ? null : Number(row.compareAtPrice),
    sku: row.sku,
    status: row.status,
    featured: row.featured,
    createdAt: row.createdAt,
    categoryId: row.categories[0]?.category.id ?? null,
    categoryName: row.categories[0]?.category.name ?? null,
    brandId: row.brand?.id ?? null,
    brandName: row.brand?.name ?? null,
    images: row.images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((image) => image.url),
    stock: inventory?.quantity ?? 0,
    lowStockThreshold: inventory?.lowStockThreshold ?? 5
  };
}
