export type OtpPurposeValue = 'login' | 'register' | 'reset' | 'admin_login';

export interface AuthUserOutput {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'admin';
  status: 'active' | 'suspended';
  createdAt: Date;
}

export interface AdminOutput {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin';
  status: 'active' | 'suspended';
  createdAt: Date;
}

export interface SessionOutput {
  accessToken: string;
  refreshToken: string;
}
