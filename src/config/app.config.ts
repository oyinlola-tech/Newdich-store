import { z } from 'zod';

const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info')
});

const parsed = appSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid app configuration:\n- ${details.join('\n- ')}`);
}

export const appConfig = parsed.data;
export type AppConfig = typeof appConfig;
