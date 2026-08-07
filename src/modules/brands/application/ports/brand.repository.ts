import type { Brand } from '@prisma/client';

export interface CreateBrandInput {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateBrandInput {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface BrandListResult {
  brands: Brand[];
  total: number;
}

export interface BrandRepositoryPort {
  findById(id: string): Promise<Brand | null>;
  findBySlug(slug: string): Promise<Brand | null>;
  findByName(name: string): Promise<Brand | null>;
  list(includeInactive: boolean): Promise<BrandListResult>;
  create(input: CreateBrandInput): Promise<Brand>;
  update(id: string, input: UpdateBrandInput): Promise<Brand>;
  delete(id: string): Promise<void>;
}
