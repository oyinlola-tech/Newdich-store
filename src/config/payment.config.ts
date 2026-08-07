import { z } from 'zod';

const paymentSchema = z.object({
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  NOMBA_API_KEY: z.string().optional()
});

const parsed = paymentSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid payment configuration:\n- ${details.join('\n- ')}`);
}

export const paymentConfig = parsed.data;
export type PaymentConfig = typeof paymentConfig;
