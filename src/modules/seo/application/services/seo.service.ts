import type { SeoRepositoryPort, SeoSetting, ProductSeo } from '../../application/ports/seo.repository.js';

export class SeoService {
  constructor(private readonly seoRepository: SeoRepositoryPort) {}

  async getGlobalSeo(): Promise<SeoSetting | null> {
    return this.seoRepository.getGlobalSeo();
  }

  async updateGlobalSeo(data: Partial<SeoSetting>): Promise<SeoSetting> {
    return this.seoRepository.updateGlobalSeo(data);
  }

  async getProductSeo(slug: string): Promise<ProductSeo | null> {
    return this.seoRepository.getProductSeo(slug);
  }

  async updateProductSeo(slug: string, data: Partial<ProductSeo>): Promise<ProductSeo> {
    return this.seoRepository.updateProductSeo(slug, data);
  }
}
