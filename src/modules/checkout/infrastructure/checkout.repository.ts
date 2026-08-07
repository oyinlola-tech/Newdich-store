import type { PrismaClient } from '@prisma/client';

export interface CheckoutItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

export class CheckoutRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async validateStock(items: CheckoutItem[]): Promise<void> {
    for (const item of items) {
      const inventory = await this.prisma.inventory.findFirst({
        where: item.variantId ? { variantId: item.variantId } : { productId: item.productId, variantId: null }
      });
      const available = inventory?.quantity ?? 0;
      if (available < item.quantity) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        throw new Error(`Not enough stock for ${product?.name ?? item.productId}.`);
      }
    }
  }

  async decrementStock(items: CheckoutItem[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const inventory = await tx.inventory.findFirst({
          where: item.variantId ? { variantId: item.variantId } : { productId: item.productId, variantId: null }
        });
        if (inventory) {
          await tx.inventory.update({
            where: { productId: inventory.productId },
            data: { quantity: Math.max(0, inventory.quantity - item.quantity) }
          });
        }
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId ?? null,
            type: 'SALE',
            quantity: item.quantity,
            reason: 'Order checkout'
          }
        });
      }
    });
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }
}
