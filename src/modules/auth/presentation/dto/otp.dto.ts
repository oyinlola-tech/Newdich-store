import type { OtpPurposeValue } from '../../domain/types/auth.types.js';

export interface RequestOtpDto {
  email: string;
  purpose: OtpPurposeValue;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
  purpose: OtpPurposeValue;
  otpToken: string;
}
