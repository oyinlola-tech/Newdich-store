import { z } from 'zod';

const storageSchema = z.object({
  UPLOADS_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().default(10),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const parsed = storageSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid storage configuration:\n- ${details.join('\n- ')}`);
}

export const storageConfig = parsed.data;
export type StorageConfig = typeof storageConfig;
