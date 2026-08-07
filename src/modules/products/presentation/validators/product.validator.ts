import { z } from 'zod';

export const createProductValidator = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(5000),
  price: z.coerce.number().nonnegative('Price must be positive'),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  brandId: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  featured: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  images: z.array(z.string().url('Invalid image URL')).optional()
});

export const updateProductValidator = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200).optional(),
  description: z.string().trim().min(1, 'Description is required').max(5000).optional(),
  price: z.coerce.number().nonnegative('Price must be positive').optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  brandId: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  featured: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  images: z.array(z.string()).optional()
});
