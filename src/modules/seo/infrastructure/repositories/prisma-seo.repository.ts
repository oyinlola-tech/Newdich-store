import type { PrismaClient } from '@prisma/client';
import type { SeoRepositoryPort, SeoSetting, ProductSeo } from '../../application/ports/seo.repository.js';

export class PrismaSeoRepository implements SeoRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async getGlobalSeo(): Promise<SeoSetting | null> {
    return this.prisma.seoSetting.findFirst();
  }

  async updateGlobalSeo(data: Partial<SeoSetting>): Promise<SeoSetting> {
    const existing = await this.prisma.seoSetting.findFirst();
    if (!existing) {
      return this.prisma.seoSetting.create({ data: data as never });
    }
    return this.prisma.seoSetting.update({ where: { id: existing.id }, data });
  }

  async getProductSeo(slug: string): Promise<ProductSeo | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { seoTitle: true, seoDescription: true, seoKeywords: true, ogImage: true, metaRobots: true }
    });
    if (!product) return null;
    return {
      slug,
      seoTitle: product.seoTitle ?? undefined,
      seoDescription: product.seoDescription ?? undefined,
      seoKeywords: product.seoKeywords ?? undefined,
      ogImage: product.ogImage ?? undefined,
      metaRobots: product.metaRobots
    };
  }

  async updateProductSeo(slug: string, data: Partial<ProductSeo>): Promise<ProductSeo> {
    const product = await this.prisma.product.update({
      where: { slug },
      data: data as never,
      select: { seoTitle: true, seoDescription: true, seoKeywords: true, ogImage: true, metaRobots: true }
    });
    return {
      slug,
      seoTitle: product.seoTitle ?? undefined,
      seoDescription: product.seoDescription ?? undefined,
      seoKeywords: product.seoKeywords ?? undefined,
      ogImage: product.ogImage ?? undefined,
      metaRobots: product.metaRobots
    };
  }
}
