import { z } from 'zod';

export const updateProfileValidator = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120).optional(),
  email: z.string().trim().email('Please enter a valid email address').optional(),
  phone: z
    .union([z.string().trim().max(30), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v === '' || v === null ? null : v)),
  birthday: z
    .union([z.string().trim().max(10), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v === '' || v === null ? null : v))
});

export const adminUpdateUserValidator = z.object({
  role: z.enum(['admin', 'customer', 'user']).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional()
});
