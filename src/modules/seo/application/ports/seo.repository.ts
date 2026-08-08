export interface SeoSetting {
  id: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords?: string | null;
  ogImage?: string | null;
  twitterHandle?: string | null;
  googleAnalyticsId?: string | null;
  facebookPixelId?: string | null;
  robotsTxt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSeo {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  metaRobots: string;
  slug: string;
}

export interface SeoRepositoryPort {
  getGlobalSeo(): Promise<SeoSetting | null>;
  updateGlobalSeo(data: Partial<SeoSetting>): Promise<SeoSetting>;
  getProductSeo(slug: string): Promise<ProductSeo | null>;
  updateProductSeo(slug: string, data: Partial<ProductSeo>): Promise<ProductSeo>;
}
