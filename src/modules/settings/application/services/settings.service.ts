import type { SettingsRepositoryPort } from '../../infrastructure/repositories/prisma-settings.repository.js';

export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

  async getPublic() {
    const all = await this.settingsRepository.getAll();
    const publicKeys = ['storeName', 'storeDescription', 'currency', 'contactEmail', 'contactPhone'];
    return all
      .filter((entry) => publicKeys.includes(entry.key))
      .reduce<Record<string, unknown>>((acc, entry) => {
        acc[entry.key] = entry.value;
        return acc;
      }, {});
  }

  async getAll() {
    const all = await this.settingsRepository.getAll();
    return all.reduce<Record<string, unknown>>((acc, entry) => {
      acc[entry.key] = entry.value;
      return acc;
    }, {});
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.settingsRepository.set(key, value);
  }
}
