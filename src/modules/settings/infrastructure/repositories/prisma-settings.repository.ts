import type { PrismaClient } from '@prisma/client';
import type { StoreSettings } from '@prisma/client';

export interface SettingsRepositoryPort {
  get(key: string): Promise<StoreSettings | null>;
  getAll(): Promise<StoreSettings[]>;
  set(key: string, value: unknown, description?: string): Promise<StoreSettings>;
}

export class PrismaSettingsRepository implements SettingsRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  get(key: string): Promise<StoreSettings | null> {
    return this.prisma.storeSettings.findUnique({ where: { key } });
  }

  getAll(): Promise<StoreSettings[]> {
    return this.prisma.storeSettings.findMany({ orderBy: { key: 'asc' } });
  }

  async set(key: string, value: unknown, description?: string): Promise<StoreSettings> {
    return this.prisma.storeSettings.upsert({
      where: { key },
      update: { value: value as never, description },
      create: { key, value: value as never, description }
    });
  }
}
