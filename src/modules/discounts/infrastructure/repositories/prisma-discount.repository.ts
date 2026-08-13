import type { PrismaClient, Discount, DiscountScope, DiscountType } from '@prisma/client';

export interface DiscountCreateInput {
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  categoryId?: string;
  productId?: string;
  brandId?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

export interface DiscountRepositoryPort {
  create(input: DiscountCreateInput): Promise<Discount>;
  findById(id: string): Promise<Discount | null>;
  list(filters: { scope?: string; status?: string }, page: number, limit: number): Promise<{ discounts: Discount[]; total: number }>;
  listActive(): Promise<Discount[]>;
  update(id: string, input: Partial<DiscountCreateInput>): Promise<Discount>;
  remove(id: string): Promise<void>;
}

export class PrismaDiscountRepository implements DiscountRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: DiscountCreateInput): Promise<Discount> {
    return this.prisma.discount.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        type: input.type,
        value: input.value,
        scope: input.scope,
        categoryId: input.categoryId ?? null,
        productId: input.productId ?? null,
        brandId: input.brandId ?? null,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        isActive: input.isActive ?? true
      }
    });
  }

  findById(id: string): Promise<Discount | null> {
    return this.prisma.discount.findUnique({ where: { id } });
  }

  async list(filters: { scope?: string; status?: string }, page: number, limit: number): Promise<{ discounts: Discount[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.scope) where.scope = filters.scope;
    if (filters.status === 'ACTIVE') where.isActive = true;
    if (filters.status === 'INACTIVE') where.isActive = false;
    const [discounts, total] = await this.prisma.$transaction([
      this.prisma.discount.findMany({
        where,
        include: { category: true, product: { select: { id: true, name: true } }, brand: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.discount.count({ where })
    ]);
    return { discounts, total };
  }

  async listActive(): Promise<Discount[]> {
    const now = new Date();
    return this.prisma.discount.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
        ]
      },
      include: { category: true, product: { select: { id: true, name: true } }, brand: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  update(id: string, input: Partial<DiscountCreateInput>): Promise<Discount> {
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.type !== undefined) data.type = input.type;
    if (input.value !== undefined) data.value = input.value;
    if (input.scope !== undefined) data.scope = input.scope;
    if (input.categoryId !== undefined) data.categoryId = input.categoryId || null;
    if (input.productId !== undefined) data.productId = input.productId || null;
    if (input.brandId !== undefined) data.brandId = input.brandId || null;
    if (input.startsAt !== undefined) data.startsAt = input.startsAt ? new Date(input.startsAt) : null;
    if (input.endsAt !== undefined) data.endsAt = input.endsAt ? new Date(input.endsAt) : null;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    return this.prisma.discount.update({
      where: { id },
      data
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.discount.delete({ where: { id } });
  }
}
