import { z } from 'zod';

export const requestOtpValidator = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  purpose: z.enum(['login', 'register', 'reset', 'admin_login'])
});

export const verifyOtpValidator = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
  purpose: z.enum(['login', 'register', 'reset', 'admin_login']),
  otpToken: z.string().min(1, 'Missing OTP token')
});
