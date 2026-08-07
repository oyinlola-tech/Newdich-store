import type { PrismaClient } from '@prisma/client';
import type { Cart, CartItem } from '@prisma/client';

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CartItemWithDetails extends CartItem {
  product: { id: string; name: string; slug: string; price: unknown; status: string };
  variant?: { id: string; name: string; sku: string | null; priceDelta: unknown } | null;
}

export interface CartRepositoryPort {
  getOrCreate(userId: string): Promise<Cart>;
  getWithItems(userId: string): Promise<{ cart: Cart; items: CartItemWithDetails[] } | null>;
  addItem(userId: string, input: AddCartItemInput): Promise<CartItem>;
  updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartItem>;
  removeItem(userId: string, itemId: string): Promise<void>;
  clear(userId: string): Promise<void>;
}

const itemInclude = {
  product: { select: { id: true, name: true, slug: true, price: true, status: true } },
  variant: { select: { id: true, name: true, sku: true, priceDelta: true } }
} as const;

export class PrismaCartRepository implements CartRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreate(userId: string): Promise<Cart> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) return cart;
    return this.prisma.cart.create({ data: { userId } });
  }

  async getWithItems(userId: string): Promise<{ cart: Cart; items: CartItemWithDetails[] } | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: itemInclude, orderBy: { createdAt: 'asc' } } }
    });
    if (!cart) return null;
    return { cart, items: cart.items as CartItemWithDetails[] };
  }

  async addItem(userId: string, input: AddCartItemInput): Promise<CartItem> {
    const cart = await this.getOrCreate(userId);
    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId ?? null
      }
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + input.quantity }
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId ?? null,
        quantity: input.quantity
      }
    });
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartItem> {
    const cart = await this.getOrCreate(userId);
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) {
      throw new Error('Cart item not found.');
    }
    return this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const cart = await this.getOrCreate(userId);
    await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.getOrCreate(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}
