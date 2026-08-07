import type { CategoryStatus } from '@prisma/client';

export interface CreateCategoryDto {
  name: string;
  parentId?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateCategoryDto {
  name?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  status?: 'active' | 'inactive';
}

export type { CategoryStatus };
