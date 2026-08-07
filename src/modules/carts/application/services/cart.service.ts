import type { CartRepositoryPort } from '../../infrastructure/repositories/prisma-cart.repository.js';
import type { ProductRepositoryPort } from '../../../products/application/ports/product.repository.js';

export class CartService {
  constructor(
    private readonly cartRepository: CartRepositoryPort,
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async getCart(userId: string) {
    const result = await this.cartRepository.getWithItems(userId);
    if (!result) {
      const cart = await this.cartRepository.getOrCreate(userId);
      return { cart, items: [] };
    }
    return result;
  }

  async addItem(userId: string, productId: string, quantity: number, variantId?: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }
    if (product.status !== 'ACTIVE') {
      throw new Error('Product is not available.');
    }

    const stock = product.stock;
    if (stock < quantity) {
      throw new Error('Not enough stock available.');
    }

    return this.cartRepository.addItem(userId, { productId, variantId, quantity });
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1.');
    }
    return this.cartRepository.updateItemQuantity(userId, itemId, quantity);
  }

  removeItem(userId: string, itemId: string) {
    return this.cartRepository.removeItem(userId, itemId);
  }

  clear(userId: string) {
    return this.cartRepository.clear(userId);
  }
}
