import type { CachePort } from '../../application/ports/cache.port.js';

export class NoopCacheProvider implements CachePort {
  async get(): Promise<string | null> {
    return null;
  }

  async set(): Promise<void> {}

  async del(): Promise<void> {}
}
