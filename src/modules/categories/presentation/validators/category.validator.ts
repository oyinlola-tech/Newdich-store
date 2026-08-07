import { z } from 'zod';

export const createCategoryValidator = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().url('Invalid image URL').nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

export const updateCategoryValidator = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120).optional(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().url('Invalid image URL').nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional()
});
