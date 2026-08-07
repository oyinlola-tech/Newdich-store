import type { PrismaClient, Brand } from '@prisma/client';
import type {
  BrandRepositoryPort,
  CreateBrandInput,
  UpdateBrandInput,
  BrandListResult
} from '../../application/ports/brand.repository.js';

export class PrismaBrandRepository implements BrandRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({ where: { slug } });
  }

  findByName(name: string): Promise<Brand | null> {
    return this.prisma.brand.findFirst({
      where: { name: { equals: name } }
    });
  }

  async list(includeInactive: boolean): Promise<BrandListResult> {
    const where = includeInactive ? {} : { isActive: true };
    const brands = await this.prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    return { brands, total: brands.length };
  }

  create(input: CreateBrandInput): Promise<Brand> {
    return this.prisma.brand.create({ data: input });
  }

  update(id: string, input: UpdateBrandInput): Promise<Brand> {
    return this.prisma.brand.update({ where: { id }, data: input });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.brand.delete({ where: { id } });
  }
}
