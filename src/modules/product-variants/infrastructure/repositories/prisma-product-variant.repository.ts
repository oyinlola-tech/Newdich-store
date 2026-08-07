import type { PrismaClient } from '@prisma/client';
import type { ProductVariant } from '@prisma/client';

export interface CreateVariantInput {
  name: string;
  sku?: string;
  attributes?: Record<string, unknown>;
  priceDelta?: number;
  stock?: number;
}

export interface UpdateVariantInput {
  name?: string;
  sku?: string;
  attributes?: Record<string, unknown>;
  priceDelta?: number;
}

export interface ProductVariantRepositoryPort {
  findById(id: string): Promise<ProductVariant | null>;
  findByProductId(productId: string): Promise<ProductVariant[]>;
  findBySku(sku: string): Promise<ProductVariant | null>;
  create(productId: string, input: CreateVariantInput): Promise<ProductVariant>;
  update(id: string, input: UpdateVariantInput): Promise<ProductVariant>;
  delete(id: string): Promise<void>;
}

export class PrismaProductVariantRepository implements ProductVariantRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<ProductVariant | null> {
    return this.prisma.productVariant.findUnique({ where: { id } });
  }

  findByProductId(productId: string): Promise<ProductVariant[]> {
    return this.prisma.productVariant.findMany({ where: { productId }, orderBy: { createdAt: 'asc' } });
  }

  findBySku(sku: string): Promise<ProductVariant | null> {
    return this.prisma.productVariant.findFirst({ where: { sku } });
  }

  async create(productId: string, input: CreateVariantInput): Promise<ProductVariant> {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          name: input.name,
          sku: input.sku ?? null,
          attributes: (input.attributes as never) ?? undefined,
          priceDelta: input.priceDelta ?? 0
        }
      });

      const isFirst = (await tx.productVariant.count({ where: { productId } })) === 1;
      if (isFirst) {
        await tx.productVariant.update({ where: { id: variant.id }, data: { isDefault: true } });
      }

      await tx.inventory.upsert({
        where: { variantId: variant.id },
        update: { quantity: input.stock ?? 0 },
        create: { productId, variantId: variant.id, quantity: input.stock ?? 0 }
      });

      if (input.stock && input.stock > 0) {
        await tx.stockMovement.create({
          data: {
            productId,
            variantId: variant.id,
            type: 'INITIAL',
            quantity: input.stock,
            reason: 'Initial stock'
          }
        });
      }

      return variant;
    });
  }

  async update(id: string, input: UpdateVariantInput): Promise<ProductVariant> {
    return this.prisma.productVariant.update({
      where: { id },
      data: {
        name: input.name,
        sku: input.sku,
        attributes: input.attributes as never,
        priceDelta: input.priceDelta
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.inventory.deleteMany({ where: { variantId: id } }),
      this.prisma.productVariant.delete({ where: { id } })
    ]);
  }
}
