import { CategoryStatus, type Category } from '@prisma/client';
import type { CategoryRepositoryPort } from '../ports/category.repository.js';
import type { CachePort } from '../../../../core/application/ports/cache.port.js';
import { CategorySlugValueObject } from '../../domain/value-objects/category-slug.value-object.js';
import { CategoryAlreadyExistsError, CategoryHasProductsError, CategoryNotFoundError } from '../../domain/errors/category.error.js';
import type { CreateCategoryDto, UpdateCategoryDto } from '../../presentation/dto/category.dto.js';

export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepositoryPort,
    private readonly cache: CachePort
  ) {}

  async listPublic(): Promise<Category[]> {
    const cached = await this.cache.get('categories:public');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fall through
      }
    }
    const { categories } = await this.categoryRepository.list(false);
    await this.cache.set('categories:public', JSON.stringify(categories), 300);
    return categories;
  }

  async listAdmin(): Promise<Category[]> {
    const { categories } = await this.categoryRepository.list(true);
    return categories;
  }

  async getByIdOrSlug(value: string): Promise<Category> {
    const category =
      (await this.categoryRepository.findById(value)) ??
      (await this.categoryRepository.findBySlug(value));
    if (!category) {
      throw new CategoryNotFoundError();
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const name = dto.name.trim();
    const existing = await this.categoryRepository.findByName(name);
    if (existing) {
      throw new CategoryAlreadyExistsError();
    }

    const category = await this.categoryRepository.create({
      name,
      slug: CategorySlugValueObject.create(name).value,
      parentId: dto.parentId ?? null,
      imageUrl: dto.imageUrl ?? null,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status === 'inactive' ? CategoryStatus.INACTIVE : CategoryStatus.ACTIVE
    });
    await this.cache.del('categories:public');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.ensureExists(id);

    const patch: {
      name?: string;
      slug?: string;
      parentId?: string | null;
      imageUrl?: string | null;
      sortOrder?: number;
      status?: CategoryStatus;
    } = {};

    if (dto.name !== undefined) {
      patch.name = dto.name.trim();
      patch.slug = CategorySlugValueObject.create(dto.name).value;
    }
    if (dto.parentId !== undefined) {
      patch.parentId = dto.parentId;
    }
    if (dto.imageUrl !== undefined) {
      patch.imageUrl = dto.imageUrl;
    }
    if (dto.sortOrder !== undefined) {
      patch.sortOrder = dto.sortOrder;
    }
    if (dto.status !== undefined) {
      patch.status = dto.status === 'active' ? CategoryStatus.ACTIVE : CategoryStatus.INACTIVE;
    }

    const category = await this.categoryRepository.update(id, patch);
    await this.cache.del('categories:public');
    return category;
  }

  async delete(id: string): Promise<void> {
    await this.ensureExists(id);
    const linked = await this.categoryRepository.countProducts(id);
    if (linked > 0) {
      throw new CategoryHasProductsError();
    }
    await this.categoryRepository.delete(id);
    await this.cache.del('categories:public');
  }

  private async ensureExists(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundError();
    }
  }
}
