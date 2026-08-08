import { z } from 'zod';

const emailSchema = z.object({
  EMAIL_PROVIDER: z.enum(['console', 'resend', 'sendbyte', 'smtp', 'sendgrid', 'mailgun']).default('sendbyte'),
  RESEND_API_KEY: z.string().optional(),
  SEND_BYTE_API_KEY: z.string().optional(),
  SEND_BYTE_BASE_URL: z.string().default('https://api.sendbyte.africa'),
  SEND_BYTE_WEBHOOK_SECRET: z.string().optional(),
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().default(''),
  MAILGUN_BASE_URL: z.string().default('https://api.mailgun.net/v3'),
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
