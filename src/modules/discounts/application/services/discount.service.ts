import type { DiscountRepositoryPort, DiscountCreateInput } from '../../infrastructure/repositories/prisma-discount.repository.js';

export const DISCOUNT_SCOPES = ['ALL', 'CATEGORY', 'PRODUCT', 'BRAND'] as const;
export const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'] as const;

export class DiscountService {
  constructor(private readonly discountRepository: DiscountRepositoryPort) {}

  async create(input: DiscountCreateInput) {
    this.validate(input);
    return this.discountRepository.create(input);
  }

  getById(id: string) {
    return this.discountRepository.findById(id);
  }

  list(filters: { scope?: string; status?: string }, page: number, limit: number) {
    return this.discountRepository.list(filters, page, limit);
  }

  listActive() {
    return this.discountRepository.listActive();
  }

  async update(id: string, input: Partial<DiscountCreateInput>) {
    const existing = await this.discountRepository.findById(id);
    if (!existing) {
      throw new Error('Discount not found.');
    }
    if (input.value !== undefined && input.value <= 0) {
      throw new Error('Discount value must be positive.');
    }
    if (input.type === 'PERCENTAGE' && input.value !== undefined && input.value > 100) {
      throw new Error('Percentage discount cannot exceed 100.');
    }
    return this.discountRepository.update(id, input);
  }

  async remove(id: string) {
    await this.discountRepository.remove(id);
  }

  private validate(input: DiscountCreateInput) {
    if (!input.name?.trim()) {
      throw new Error('name is required.');
    }
    if (!DISCOUNT_TYPES.includes(input.type)) {
      throw new Error(`type must be one of: ${DISCOUNT_TYPES.join(', ')}.`);
    }
    if (!DISCOUNT_SCOPES.includes(input.scope)) {
      throw new Error(`scope must be one of: ${DISCOUNT_SCOPES.join(', ')}.`);
    }
    if (input.value <= 0) {
      throw new Error('Discount value must be positive.');
    }
    if (input.type === 'PERCENTAGE' && input.value > 100) {
      throw new Error('Percentage discount cannot exceed 100.');
    }
    if (input.scope !== 'ALL' && !input.categoryId && !input.productId && !input.brandId) {
      throw new Error('A category, product or brand must be selected for this scope.');
    }
    if (input.startsAt && input.endsAt && new Date(input.startsAt) > new Date(input.endsAt)) {
      throw new Error('startsAt cannot be after endsAt.');
    }
  }
}
