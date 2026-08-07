import { z } from 'zod';

const cacheSchema = z.object({
  REDIS_URL: z.string().optional()
});

const parsed = cacheSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid cache configuration:\n- ${details.join('\n- ')}`);
}

export const cacheConfig = parsed.data;
export type CacheConfig = typeof cacheConfig;
