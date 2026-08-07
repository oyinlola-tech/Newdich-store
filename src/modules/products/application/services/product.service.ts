import { ProductStatus } from '@prisma/client';
import type { ProductRepositoryPort } from '../ports/product.repository.js';
import type { ProductFilters, ProductWithRelations } from '../../domain/types/product.types.js';
import { ProductNotFoundError } from '../../domain/errors/product.error.js';
import { ProductSlugValueObject } from '../../domain/value-objects/product-slug.value-object.js';
import { ProductPriceValueObject } from '../../domain/value-objects/product-price.value-object.js';
import { SkuValueObject } from '../../domain/value-objects/sku.value-object.js';
import type { CategoryRepositoryPort } from '../../../categories/application/ports/category.repository.js';
import { CategoryNotFoundError } from '../../../categories/domain/errors/category.error.js';
import type { BrandRepositoryPort } from '../../../brands/application/ports/brand.repository.js';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  categoryId?: string | null;
  categoryName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  stock?: number;
  featured?: boolean;
  status?: 'active' | 'draft' | 'archived';
  images?: string[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string | null;
  categoryName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  stock?: number;
  featured?: boolean;
  status?: 'active' | 'draft' | 'archived';
  images?: string[];
}

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly categoryRepository: CategoryRepositoryPort,
    private readonly brandRepository: BrandRepositoryPort
  ) {}

  async list(filters: ProductFilters): Promise<{ products: ProductWithRelations[]; total: number }> {
    return this.productRepository.list(filters);
  }

  async getById(id: string): Promise<ProductWithRelations> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError();
    }
    return product;
  }

  async getBySlug(slug: string): Promise<ProductWithRelations> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new ProductNotFoundError();
    }
    return product;
  }

  async create(input: CreateProductInput): Promise<ProductWithRelations> {
    const price = ProductPriceValueObject.create(input.price).value;
    const categoryId = await this.resolveCategory(input.categoryId, input.categoryName);
    const brandId = await this.resolveBrand(input.brandId, input.brandName);

    return this.productRepository.create({
      name: input.name.trim(),
      slug: ProductSlugValueObject.create(input.name).value,
      description: input.description.trim(),
      price,
      sku: SkuValueObject.create(null)?.value ?? null,
      status: mapStatus(input.status),
      featured: input.featured ?? false,
      categoryId,
      brandId,
      images: input.images ?? [],
      stock: input.stock ?? 0
    });
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductWithRelations> {
    await this.getById(id);

    const data: Record<string, unknown> = {};

    if (input.name !== undefined) {
      data.name = input.name.trim();
      data.slug = ProductSlugValueObject.create(input.name).value;
    }
    if (input.description !== undefined) {
      data.description = input.description.trim();
    }
    if (input.price !== undefined) {
      data.price = ProductPriceValueObject.create(input.price).value;
    }
    if (input.status !== undefined) {
      data.status = mapStatus(input.status);
    }
    if (input.featured !== undefined) {
      data.featured = input.featured;
    }
    if (input.images !== undefined) {
      data.images = input.images;
    }
    if (input.categoryId !== undefined || input.categoryName !== undefined) {
      data.categoryId = await this.resolveCategory(input.categoryId, input.categoryName);
    }
    if (input.brandId !== undefined || input.brandName !== undefined) {
      data.brandId = await this.resolveBrand(input.brandId, input.brandName);
    }
    if (input.stock !== undefined) {
      data.stock = input.stock;
    }

    return this.productRepository.update(id, data as never);
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.productRepository.delete(id);
  }

  async publish(id: string): Promise<ProductWithRelations> {
    return this.productRepository.update(id, { status: ProductStatus.ACTIVE });
  }

  async archive(id: string): Promise<ProductWithRelations> {
    return this.productRepository.update(id, { status: ProductStatus.ARCHIVED });
  }

  private async resolveCategory(categoryId?: string | null, categoryName?: string | null): Promise<string | null> {
    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new CategoryNotFoundError();
      }
      return category.id;
    }

    if (categoryName) {
      const category = await this.categoryRepository.findByName(categoryName);
      if (!category) {
        throw new CategoryNotFoundError();
      }
      return category.id;
    }

    return null;
  }

  private async resolveBrand(brandId?: string | null, brandName?: string | null): Promise<string | null> {
    if (brandId) {
      const brand = await this.brandRepository.findById(brandId);
      if (!brand) {
        throw new Error('Brand not found.');
      }
      return brand.id;
    }

    if (brandName) {
      const brand =
        (await this.brandRepository.findByName(brandName)) ??
        (await this.brandRepository.findBySlug(brandName));
      if (!brand) {
        throw new Error('Brand not found.');
      }
      return brand.id;
    }

    return null;
  }
}

function mapStatus(status: 'active' | 'draft' | 'archived' | undefined): ProductStatus {
  switch (status) {
    case 'draft':
      return ProductStatus.DRAFT;
    case 'archived':
      return ProductStatus.ARCHIVED;
    default:
      return ProductStatus.ACTIVE;
  }
}
