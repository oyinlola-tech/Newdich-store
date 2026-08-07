import type { PrismaClient, Category, CategoryStatus } from '@prisma/client';
import type {
  CategoryRepositoryPort,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryListResult
} from '../../application/ports/category.repository.js';

export class PrismaCategoryRepository implements CategoryRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { name: { equals: name } }
    });
  }

  async list(includeInactive: boolean): Promise<CategoryListResult> {
    const where = includeInactive ? {} : { status: 'ACTIVE' as CategoryStatus };
    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
    return { categories, total: categories.length };
  }

  create(input: CreateCategoryInput): Promise<Category> {
    return this.prisma.category.create({ data: input });
  }

  update(id: string, input: UpdateCategoryInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data: input });
  }

  countProducts(categoryId: string): Promise<number> {
    return this.prisma.categoryProduct.count({ where: { categoryId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}
