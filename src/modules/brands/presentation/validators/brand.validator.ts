import { z } from 'zod';

export const brandValidator = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  description: z.string().trim().max(500).optional(),
  logoUrl: z.string().url('Invalid logo URL').nullable().optional(),
  isActive: z.boolean().optional()
});

export const brandUpdateValidator = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  logoUrl: z.string().url('Invalid logo URL').nullable().optional(),
  isActive: z.boolean().optional()
});
