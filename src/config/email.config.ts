import { z } from 'zod';

const emailSchema = z.object({
  EMAIL_PROVIDER: z.enum(['console', 'resend', 'sendbyte']).default('console'),
  RESEND_API_KEY: z.string().optional(),
  SEND_BYTE_API_KEY: z.string().optional(),
  SEND_BYTE_BASE_URL: z.string().default('https://api.sendbyte.africa'),
  SEND_BYTE_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_FROM: z.string().default('Telente Store <no-reply@telente.site>'),
  ADMIN_EMAIL: z.string().default('admin@telente.site')
});

const parsed = emailSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid email configuration:\n- ${details.join('\n- ')}`);
}

export const emailConfig = parsed.data;
export type EmailConfig = typeof emailConfig;
