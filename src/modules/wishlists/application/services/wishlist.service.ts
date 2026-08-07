import type { WishlistRepositoryPort } from '../../infrastructure/repositories/prisma-wishlist.repository.js';

export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepositoryPort) {}

  list(userId: string) {
    return this.wishlistRepository.findByUser(userId);
  }

  async add(userId: string, productId: string) {
    const exists = await this.wishlistRepository.exists(userId, productId);
    if (exists) {
      return this.wishlistRepository.findByUser(userId);
    }
    await this.wishlistRepository.add(userId, productId);
    return this.wishlistRepository.findByUser(userId);
  }

  async remove(userId: string, itemId: string) {
    await this.wishlistRepository.remove(userId, itemId);
  }

  async toggle(userId: string, productId: string) {
    const exists = await this.wishlistRepository.exists(userId, productId);
    if (exists) {
      await this.wishlistRepository.removeByProduct(userId, productId);
      return { inWishlist: false };
    }
    await this.wishlistRepository.add(userId, productId);
    return { inWishlist: true };
  }
}
