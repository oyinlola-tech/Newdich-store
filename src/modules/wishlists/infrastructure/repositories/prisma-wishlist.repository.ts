import type { PrismaClient } from '@prisma/client';
import type { WishlistItem } from '@prisma/client';

export interface WishlistRepositoryPort {
  findByUser(userId: string): Promise<WishlistItem[]>;
  add(userId: string, productId: string): Promise<WishlistItem>;
  remove(userId: string, itemId: string): Promise<void>;
  removeByProduct(userId: string, productId: string): Promise<void>;
  exists(userId: string, productId: string): Promise<boolean>;
}

export class PrismaWishlistRepository implements WishlistRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findByUser(userId: string): Promise<WishlistItem[]> {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            status: true,
            images: { select: { url: true }, orderBy: { position: 'asc' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async add(userId: string, productId: string): Promise<WishlistItem> {
    return this.prisma.wishlistItem.create({ data: { userId, productId } });
  }

  async remove(userId: string, itemId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({ where: { id: itemId, userId } });
  }

  async removeByProduct(userId: string, productId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  }

  exists(userId: string, productId: string): Promise<boolean> {
    return this.prisma.wishlistItem
      .findUnique({ where: { userId_productId: { userId, productId } } })
      .then(Boolean);
  }
}
