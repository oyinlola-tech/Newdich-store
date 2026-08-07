import type { ProductVariantRepositoryPort } from '../../infrastructure/repositories/prisma-product-variant.repository.js';

export class ProductVariantService {
  constructor(private readonly variantRepository: ProductVariantRepositoryPort) {}

  getByProductId(productId: string) {
    return this.variantRepository.findByProductId(productId);
  }

  getById(id: string) {
    return this.variantRepository.findById(id);
  }

  create(productId: string, input: Parameters<ProductVariantRepositoryPort['create']>[1]) {
    return this.variantRepository.create(productId, input);
  }

  update(id: string, input: Parameters<ProductVariantRepositoryPort['update']>[1]) {
    return this.variantRepository.update(id, input);
  }

  async remove(id: string): Promise<void> {
    await this.variantRepository.delete(id);
  }
}
