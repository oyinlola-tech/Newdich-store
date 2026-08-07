import type { Category } from '@prisma/client';

export interface CategoryOutput {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export function toCategoryOutput(category: Category): CategoryOutput {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    imageUrl: category.imageUrl,
    sortOrder: category.sortOrder,
    status: category.status === 'ACTIVE' ? 'active' : 'inactive',
    createdAt: category.createdAt
  };
}
