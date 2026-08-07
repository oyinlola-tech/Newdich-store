import { z } from 'zod';

export const refreshTokenValidator = z.object({
  refreshToken: z.string().min(1, 'Missing refresh token')
});
