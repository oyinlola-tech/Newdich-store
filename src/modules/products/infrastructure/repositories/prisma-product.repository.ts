import type { PrismaClient } from '@prisma/client';
import type { ProductRepositoryPort } from '../../application/ports/product.repository.js';
import type { CreateProductData, ProductFilters, ProductListResult, ProductWithRelations, UpdateProductData } from '../../domain/types/product.types.js';
import { toProductWithRelations } from '../mappers/product.mapper.js';

const includeRelations = {
  categories: { include: { category: { select: { id: true, name: true } } } },
  images: true,
  inventory: true,
  brand: { select: { id: true, name: true } }
} as const;

export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ProductWithRelations | null> {
    const row = await this.prisma.product.findUnique({ where: { id }, include: includeRelations });
    return row ? toProductWithRelations(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    const row = await this.prisma.product.findUnique({ where: { slug }, include: includeRelations });
    return row ? toProductWithRelations(row) : null;
  }

  async list(filters: ProductFilters): Promise<ProductListResult> {
    const where: Record<string, unknown> = {};

    if (filters.featured === true) {
      where.featured = true;
    }
    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = 'ACTIVE';
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } }
      ];
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {
        ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {})
      };
    }
    if (filters.categoryId) {
      where.categories = { some: { categoryId: filters.categoryId } };
    }
    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.product.count({ where })
    ]);

    return { products: rows.map(toProductWithRelations), total };
  }

  async create(input: CreateProductData): Promise<ProductWithRelations> {
    const row = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          price: input.price,
          compareAtPrice: input.compareAtPrice ?? null,
          sku: input.sku ?? null,
          status: input.status ?? 'ACTIVE',
          featured: input.featured ?? false,
          categories: input.categoryId
            ? { create: { categoryId: input.categoryId } }
            : undefined,
          brandId: input.brandId ?? null,
          images: {
            create: input.images.map((url, index) => ({
              url,
              position: index,
              alt: input.name
            }))
          }
        }
      });

      await tx.inventory.create({
        data: {
          productId: product.id,
          quantity: input.stock,
          lowStockThreshold: input.lowStockThreshold ?? 5,
          stockMovements: {
            create: {
              productId: product.id,
              type: 'INITIAL',
              quantity: input.stock,
              reason: 'Initial stock on product creation'
            }
          }
        }
      });

      return product;
    });

    const created = await this.prisma.product.findUnique({ where: { id: row.id }, include: includeRelations });
    return toProductWithRelations(created!);
  }

  async update(id: string, input: UpdateProductData): Promise<ProductWithRelations> {
    const row = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          price: input.price,
          compareAtPrice: input.compareAtPrice,
          sku: input.sku,
          status: input.status,
          featured: input.featured,
          brandId: input.brandId
        }
      });

      if (input.categoryId !== undefined) {
        await tx.categoryProduct.deleteMany({ where: { productId: id } });
        if (input.categoryId) {
          await tx.categoryProduct.create({ data: { productId: id, categoryId: input.categoryId } });
        }
      }

      if (input.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (input.images.length > 0) {
          await tx.productImage.createMany({
            data: input.images.map((url, index) => ({
              productId: id,
              url,
              position: index,
              alt: input.name ?? product.name
            }))
          });
        }
      }

      if (input.stock !== undefined) {
        const inventory = await tx.inventory.upsert({
          where: { productId: id },
          update: {},
          create: { productId: id, quantity: 0 }
        });
        const delta = input.stock - inventory.quantity;
        await tx.inventory.update({
          where: { productId: id },
          data: { quantity: input.stock }
        });
        if (delta !== 0) {
          await tx.stockMovement.create({
            data: {
              productId: id,
              type: 'ADJUSTMENT',
              quantity: delta,
              reason: 'Stock adjusted via admin product update'
            }
          });
        }
      }

      return product;
    });

    const updated = await this.prisma.product.findUnique({ where: { id: row.id }, include: includeRelations });
    return toProductWithRelations(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  count(): Promise<number> {
    return this.prisma.product.count();
  }

  countActive(): Promise<number> {
    return this.prisma.product.count({ where: { status: 'ACTIVE' } });
  }
}
