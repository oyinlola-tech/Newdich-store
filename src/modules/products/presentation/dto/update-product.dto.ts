export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  categoryId?: string;
  stock?: number;
  featured?: boolean;
  status?: 'active' | 'draft' | 'archived';
  images?: string[];
}
