import type { SettingsRepositoryPort } from '../../../settings/infrastructure/repositories/prisma-settings.repository.js';
import { PinService, PinError } from './pin.service.js';

export const PAYMENT_PROVIDERS = ['paystack', 'flutterwave', 'nomba', 'stripe'] as const;
export type PaymentProviderName = (typeof PAYMENT_PROVIDERS)[number];

export type ProviderSecretField = 'publicKey' | 'secretKey' | 'webhookSecret' | 'accountId';

export interface ProviderCredentialFields {
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  accountId?: string;
}

export interface ProviderConfig extends ProviderCredentialFields {
  enabled: boolean;
}

export interface MaskedProviderConfig {
  enabled: boolean;
  configured: Partial<Record<ProviderSecretField, boolean>>;
  publicKeyPreview?: string;
}

const SETTINGS_PROVIDERS_KEY = 'payment.providers';
const SETTINGS_PIN_KEY = 'payment.pin';
const UNLOCK_TTL_MS = 12 * 60 * 60 * 1000;

export class PaymentSettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentSettingsError';
  }
}

export class PaymentSettingsService {
  private unlockedAt: number | null = null;
  private decrypted: Record<PaymentProviderName, ProviderConfig | null> = {
    paystack: null,
    flutterwave: null,
    nomba: null,
    stripe: null
  };

  constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

  async isPinSet(): Promise<boolean> {
    const entry = await this.settingsRepository.get(SETTINGS_PIN_KEY);
    return Boolean(entry);
  }

  async createPin(pin: string): Promise<void> {
    PinService.assertValidPin(pin);
    if (await this.isPinSet()) {
      throw new PinError('A pin already exists. Use change pin instead.');
    }
    const hash = await PinService.hashPin(pin);
    await this.settingsRepository.set(SETTINGS_PIN_KEY, hash, 'Payment settings pin (bcrypt)');
  }

  async verifyPin(pin: string): Promise<boolean> {
    const entry = await this.settingsRepository.get(SETTINGS_PIN_KEY);
    if (!entry) {
      throw new PinError('No pin set yet. Create a pin first.');
    }
    const hash = entry.value as string;
    return PinService.verifyPin(hash, pin);
  }

  async assertPin(pin: string): Promise<void> {
    const ok = await this.verifyPin(pin);
    if (!ok) {
      throw new PinError('Wrong pin.');
    }
  }

  async changePin(currentPin: string, newPin: string): Promise<void> {
    PinService.assertValidPin(newPin);
    await this.assertPin(currentPin);
    const providers = await this.readProviders();
    for (const [name, config] of Object.entries(providers)) {
      if (!config) continue;
      const reEncrypted: Record<string, string> = {};
      for (const field of ['publicKey', 'secretKey', 'webhookSecret', 'accountId'] as const) {
        const value = config[field];
        if (value) {
          const plain = PinService.decryptWithPin(currentPin, value);
          reEncrypted[field] = PinService.encryptWithPin(newPin, plain);
        }
      }
      providers[name as PaymentProviderName] = { ...config, ...reEncrypted } as ProviderConfig;
    }
    await this.settingsRepository.set(SETTINGS_PROVIDERS_KEY, providers as never);
    const hash = await PinService.hashPin(newPin);
    await this.settingsRepository.set(SETTINGS_PIN_KEY, hash, 'Payment settings pin (bcrypt)');
    this.decrypted = { paystack: null, flutterwave: null, nomba: null, stripe: null };
    this.unlockedAt = null;
  }


  private async readProviders(): Promise<Record<PaymentProviderName, ProviderConfig | null>> {
    const entry = await this.settingsRepository.get(SETTINGS_PROVIDERS_KEY);
    if (!entry) return { paystack: null, flutterwave: null, nomba: null, stripe: null };
    const raw = entry.value as Record<string, ProviderConfig | null>;
    const out = { paystack: null, flutterwave: null, nomba: null } as Record<PaymentProviderName, ProviderConfig | null>;
    for (const name of PAYMENT_PROVIDERS) {
      out[name] = raw[name] ?? null;
    }
    return out;
  }

  async getProviders(): Promise<Record<PaymentProviderName, MaskedProviderConfig | null>> {
    const providers = await this.readProviders();
    const out = {} as Record<PaymentProviderName, MaskedProviderConfig | null>;
    for (const name of PAYMENT_PROVIDERS) {
      const config = providers[name];
      if (!config) {
        out[name] = { enabled: false, configured: {} };
        continue;
      }
      const configured: Partial<Record<ProviderSecretField, boolean>> = {};
      for (const field of ['publicKey', 'secretKey', 'webhookSecret', 'accountId'] as const) {
        if (config[field]) {
          configured[field] = true;
        }
      }
      let publicKeyPreview: string | undefined;
      if (this.decrypted[name]?.publicKey) {
        publicKeyPreview = this.maskKey(this.decrypted[name]!.publicKey!);
      }
      out[name] = { enabled: config.enabled, configured, publicKeyPreview };
    }
    return out;
  }

  private maskKey(value: string): string {
    if (value.length <= 8) return '••••';
    return `${value.slice(0, 4)}••••${value.slice(-4)}`;
  }

  async saveProvider(
    name: PaymentProviderName,
    input: { enabled?: boolean; publicKey?: string; secretKey?: string; webhookSecret?: string; accountId?: string },
    pin: string
  ): Promise<void> {
    await this.assertPin(pin);
    if (!PAYMENT_PROVIDERS.includes(name)) {
      throw new PaymentSettingsError(`Unknown provider: ${name}`);
    }
    const providers = await this.readProviders();
    const current = providers[name] ?? { enabled: false };
    const next: ProviderConfig = { ...current };

    if (typeof input.enabled === 'boolean') {
      next.enabled = input.enabled;
    }
    for (const field of ['publicKey', 'secretKey', 'webhookSecret', 'accountId'] as const) {
      const value = input[field];
      if (value === undefined || value === '') continue;
      const encrypted = PinService.encryptWithPin(pin, value);
      (next as unknown as Record<string, string>)[field] = encrypted;
    }
    providers[name] = next;
    await this.settingsRepository.set(SETTINGS_PROVIDERS_KEY, providers as never);
    if (this.decrypted[name]) {
      this.decrypted[name] = { ...this.decrypted[name], ...next };
    }
  }

  async removeProvider(name: PaymentProviderName, pin: string): Promise<void> {
    await this.assertPin(pin);
    const providers = await this.readProviders();
    providers[name] = null;
    await this.settingsRepository.set(SETTINGS_PROVIDERS_KEY, providers as never);
    this.decrypted[name] = null;
  }

  async toggleProvider(name: PaymentProviderName, enabled: boolean, pin: string): Promise<void> {
    await this.assertPin(pin);
    const providers = await this.readProviders();
    const config = providers[name];
    if (!config) {
      throw new PaymentSettingsError(`Provider "${name}" is not configured. Save its keys first.`);
    }
    config.enabled = enabled;
    providers[name] = config;
    await this.settingsRepository.set(SETTINGS_PROVIDERS_KEY, providers as never);
    if (this.decrypted[name]) {
      this.decrypted[name] = { ...this.decrypted[name], enabled };
    }
  }

  async revealSecret(name: PaymentProviderName, field: ProviderSecretField, pin: string): Promise<string> {
    await this.assertPin(pin);
    const providers = await this.readProviders();
    const config = providers[name];
    if (!config || !config[field]) {
      throw new PaymentSettingsError(`No ${field} stored for ${name}.`);
    }
    return PinService.decryptWithPin(pin, config[field]);
  }


  isUnlocked(): boolean {
    return this.unlockedAt !== null && Date.now() - this.unlockedAt < UNLOCK_TTL_MS;
  }

  async unlock(pin: string): Promise<{ expiresAt: Date }> {
    await this.assertPin(pin);
    const providers = await this.readProviders();
    for (const name of PAYMENT_PROVIDERS) {
      const config = providers[name];
      if (!config) continue;
      const decrypted: ProviderConfig = { enabled: config.enabled };
      for (const field of ['publicKey', 'secretKey', 'webhookSecret', 'accountId'] as const) {
        if (config[field]) {
          (decrypted as unknown as Record<string, string>)[field] = PinService.decryptWithPin(pin, config[field]);
        }
      }
      this.decrypted[name] = decrypted;    }
    this.unlockedAt = Date.now();
    return { expiresAt: new Date(this.unlockedAt + UNLOCK_TTL_MS) };
  }

  lock(): void {
    this.decrypted = { paystack: null, flutterwave: null, nomba: null, stripe: null };
    this.unlockedAt = null;
  }

  getActiveProvider(): { name: PaymentProviderName; config: ProviderConfig } | null {
    for (const name of PAYMENT_PROVIDERS) {
      const config = this.decrypted[name];
      if (config?.enabled && (config.secretKey || config.webhookSecret)) {
        return { name, config };
      }
    }
    return null;
  }

  getProviderConfig(name: PaymentProviderName): ProviderConfig {
    if (!this.isUnlocked()) {
      throw new PaymentSettingsError('Payment settings are locked. Ask the store admin to unlock them with the pin.');
    }
    const config = this.decrypted[name];
    if (!config) {
      throw new PaymentSettingsError(`Provider "${name}" is not configured.`);
    }
    return config;
  }
}
