import type { Brand } from '@prisma/client';
import type { BrandRepositoryPort } from '../ports/brand.repository.js';
import { SlugValueObject } from '../../../../core/domain/value-objects/slug.value-object.js';

const slugify = (name: string) => SlugValueObject.create(name).value;

export class BrandService {
  constructor(private readonly brandRepository: BrandRepositoryPort) {}

  async listPublic(): Promise<Brand[]> {
    const { brands } = await this.brandRepository.list(false);
    return brands;
  }

  async listAdmin(): Promise<Brand[]> {
    const { brands } = await this.brandRepository.list(true);
    return brands;
  }

  async getByIdOrSlug(value: string): Promise<Brand> {
    const brand =
      (await this.brandRepository.findById(value)) ??
      (await this.brandRepository.findBySlug(value));
    if (!brand) {
      throw new Error('Brand not found.');
    }
    return brand;
  }

  async create(input: { name: string; description?: string; logoUrl?: string | null; isActive?: boolean }): Promise<Brand> {
    const name = input.name.trim();
    if (!name) {
      throw new Error('Brand name is required.');
    }
    const existing = await this.brandRepository.findByName(name);
    if (existing) {
      throw new Error('A brand with this name already exists.');
    }

    return this.brandRepository.create({
      name,
      slug: slugify(name),
      description: input.description ?? null,
      logoUrl: input.logoUrl ?? null,
      isActive: input.isActive ?? true
    });
  }

  async update(
    id: string,
    input: { name?: string; description?: string | null; logoUrl?: string | null; isActive?: boolean }
  ): Promise<Brand> {
    await this.ensureExists(id);

    const patch: {
      name?: string;
      slug?: string;
      description?: string | null;
      logoUrl?: string | null;
      isActive?: boolean;
    } = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      patch.name = name;
      patch.slug = slugify(name);
    }
    if (input.description !== undefined) {
      patch.description = input.description;
    }
    if (input.logoUrl !== undefined) {
      patch.logoUrl = input.logoUrl;
    }
    if (input.isActive !== undefined) {
      patch.isActive = input.isActive;
    }

    return this.brandRepository.update(id, patch);
  }

  async delete(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.brandRepository.delete(id);
  }

  private async ensureExists(id: string): Promise<void> {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new Error('Brand not found.');
    }
  }
}
