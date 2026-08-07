import { z } from 'zod';

const databaseSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required')
});

const parsed = databaseSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid database configuration:\n- ${details.join('\n- ')}`);
}

export const databaseConfig = parsed.data;
export type DatabaseConfig = typeof databaseConfig;
