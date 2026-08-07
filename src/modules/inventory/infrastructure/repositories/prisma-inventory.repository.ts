import type { PrismaClient } from '@prisma/client';
import type { Inventory, StockMovement, StockMovementType } from '@prisma/client';

export interface AdjustStockInput {
  quantity: number;
  reason?: string;
}

export interface InventoryRepositoryPort {
  findByVariantId(variantId: string): Promise<Inventory | null>;
  list(page: number, limit: number): Promise<{ items: Inventory[]; total: number }>;
  listLowStock(threshold: number): Promise<Inventory[]>;
  adjustStock(variantId: string, input: AdjustStockInput): Promise<Inventory>;
  recordMovement(movement: {
    variantId: string;
    type: StockMovementType;
    quantity: number;
    reason?: string;
  }): Promise<StockMovement>;
}

export class PrismaInventoryRepository implements InventoryRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findByVariantId(variantId: string): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({ where: { variantId } });
  }

  async list(page: number, limit: number): Promise<{ items: Inventory[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.inventory.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { variant: { include: { product: { select: { id: true, name: true, slug: true } } } } },
        orderBy: { updatedAt: 'desc' }
      }),
      this.prisma.inventory.count()
    ]);
    return { items, total };
  }

  async listLowStock(threshold: number): Promise<Inventory[]> {
    const items = await this.prisma.inventory.findMany({ include: { variant: { include: { product: { select: { id: true, name: true } } } } } });
    return items.filter((item) => item.quantity <= threshold);
  }

  async adjustStock(variantId: string, input: AdjustStockInput): Promise<Inventory> {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { variantId } });
      if (!inventory) {
        throw new Error(`No inventory record for variant ${variantId}`);
      }
      return tx.inventory.update({
        where: { variantId },
        data: { quantity: input.quantity }
      });
    });
  }

  recordMovement(movement: {
    variantId: string;
    type: StockMovementType;
    quantity: number;
    reason?: string;
  }): Promise<StockMovement> {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { variantId: movement.variantId } });
      return tx.stockMovement.create({
        data: {
          productId: inventory?.productId ?? '',
          variantId: movement.variantId,
          type: movement.type,
          quantity: movement.quantity,
          reason: movement.reason
        }
      });
    });
  }
}
