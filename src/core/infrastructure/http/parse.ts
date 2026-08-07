import type { ZodSchema } from 'zod';
import { ValidationError } from '../../domain/errors/domain.error.js';

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError('Validation failed', result.error.issues);
  }
  return result.data;
}

export function parseQuery<T>(schema: ZodSchema<T>, query: unknown): T {
  return parseBody(schema, query);
}
