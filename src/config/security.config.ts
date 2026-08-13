import { z } from 'zod';

const securitySchema = z.object({
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000)
});

const parsed = securitySchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid security configuration:\n- ${details.join('\n- ')}`);
}

export const securityConfig = parsed.data;
export type SecurityConfig = typeof securityConfig;
