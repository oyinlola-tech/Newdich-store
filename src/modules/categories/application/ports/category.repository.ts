import type { Category, CategoryStatus } from '@prisma/client';

export interface CreateCategoryInput {
  name: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  status?: CategoryStatus;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  status?: CategoryStatus;
}

export interface CategoryListResult {
  categories: Category[];
  total: number;
}

export interface CategoryRepositoryPort {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  list(includeInactive: boolean): Promise<CategoryListResult>;
  create(input: CreateCategoryInput): Promise<Category>;
  update(id: string, input: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
}
