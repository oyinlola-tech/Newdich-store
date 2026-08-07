import { z } from 'zod';

const shippingSchema = z.object({
  SHIPPING_PROVIDER: z.string().default('local'),
  SHIPPING_API_KEY: z.string().optional()
});

const parsed = shippingSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid shipping configuration:\n- ${details.join('\n- ')}`);
}

export const shippingConfig = parsed.data;
export type ShippingConfig = typeof shippingConfig;
