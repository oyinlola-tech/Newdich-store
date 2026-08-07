import { StockMovementType } from '@prisma/client';
import type { InventoryRepositoryPort } from '../../infrastructure/repositories/prisma-inventory.repository.js';

export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepositoryPort) {}

  getByVariantId(variantId: string) {
    return this.inventoryRepository.findByVariantId(variantId);
  }

  list(page: number, limit: number) {
    return this.inventoryRepository.list(page, limit);
  }

  listLowStock(threshold: number) {
    return this.inventoryRepository.listLowStock(threshold);
  }

  async adjustStock(variantId: string, quantity: number, reason?: string) {
    const previous = await this.inventoryRepository.findByVariantId(variantId);
    if (!previous) {
      throw new Error(`No inventory record for variant ${variantId}`);
    }
    const delta = quantity - previous.quantity;
    const updated = await this.inventoryRepository.adjustStock(variantId, { quantity, reason });
    await this.inventoryRepository.recordMovement({
      variantId,
      type: delta >= 0 ? StockMovementType.RESTOCK : StockMovementType.SALE,
      quantity: Math.abs(delta),
      reason
    });
    return updated;
  }
}
