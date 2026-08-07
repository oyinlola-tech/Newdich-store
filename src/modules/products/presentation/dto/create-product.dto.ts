export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category?: string;
  categoryId?: string;
  stock?: number;
  featured?: boolean;
  status?: 'active' | 'draft' | 'archived';
  images?: string[];
}

export interface UploadedProductImage {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}
