import { z } from 'zod';

export const forgotPasswordValidator = z.object({
  email: z.string().trim().email('Please enter a valid email address')
});

export const resetPasswordValidator = z.object({
  token: z.string().min(1, 'Missing reset token'),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(72)
});

export const changePasswordValidator = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long').max(72)
});
