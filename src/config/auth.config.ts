import { z } from 'zod';

const authSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.coerce.number().default(30),
  OTP_REQUIRED: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  OTP_LIFETIME_MINUTES: z.coerce.number().default(10),
  BCRYPT_ROUNDS: z.coerce.number().default(10),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_NAME: z.string().default('Super Admin'),
  ADMIN_PHONE: z.string().optional()
});

const parsed = authSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid auth configuration:\n- ${details.join('\n- ')}`);
}

export const authConfig = parsed.data;
export type AuthConfig = typeof authConfig;
