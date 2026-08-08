import type { SettingsRepositoryPort } from '../../infrastructure/repositories/prisma-settings.repository.js';

const ALLOWED_KEYS = [
  'store.name',
  'store.currency',
  'store.email',
  'store.phone',
  'store.announcement',
  'checkout.enableGuestCheckout',
  'email.orderConfirmationEnabled',
  'notifications.adminNewOrder',
  'notifications.adminEmail'
];

export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

  async getPublic() {
    const all = await this.settingsRepository.getAll();
    const publicKeys = ['store.name', 'store.currency', 'store.email', 'store.phone', 'store.announcement'];
    return all
      .filter((entry) => publicKeys.includes(entry.key))
      .reduce<Record<string, unknown>>((acc, entry) => {
        acc[entry.key] = entry.value;
        return acc;
      }, {});
  }

  isAllowedKey(key: string): boolean {
    return ALLOWED_KEYS.includes(key);
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
