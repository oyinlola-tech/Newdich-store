export interface AdminUpdateUserDto {
  role?: 'admin' | 'customer' | 'user';
  status?: 'active' | 'suspended' | 'inactive';
}
