import { Container } from './container.js';
import { getDatabase } from '../database/database.js';
import { createLogger } from '../core/infrastructure/logger/logger.service.js';
import { CommandBus } from '../core/application/commands/command-bus.js';
import { QueryBus } from '../core/application/queries/query-bus.js';
import { createEmailProvider } from '../integrations/index.js';
import { NoopCacheProvider } from '../core/infrastructure/cache/noop-cache.provider.js';
import { NoopQueueProvider } from '../core/infrastructure/queue/noop-queue.provider.js';
import { RedisCacheProvider } from '../core/infrastructure/cache/redis-cache.provider.js';
import { BullMQQueueProvider } from '../core/infrastructure/queue/bullmq-queue.provider.js';
import { TokenService } from '../modules/auth/infrastructure/security/token.service.js';
import { PasswordHasherService } from '../modules/auth/infrastructure/security/password-hasher.service.js';
import { LocalStorageProvider } from '../core/infrastructure/storage/local-storage.provider.js';
import { MailerService } from '../core/infrastructure/email/mailer.service.js';
import { authConfig, cacheConfig } from '../config/index.js';

export function buildContainer(): Container {
  const container = new Container();

  container.registerSingleton('prisma', () => getDatabase());
  container.registerSingleton('logger', () => createLogger('app'));
  container.registerSingleton('command.bus', () => new CommandBus());
  container.registerSingleton('query.bus', () => new QueryBus());
  container.registerSingleton('email.provider', (c) => createEmailProvider(c.get('logger')));
  container.registerSingleton(
    'cache.provider',
    cacheConfig.REDIS_URL ? () => new RedisCacheProvider() : () => new NoopCacheProvider()
  );
  container.registerSingleton(
    'queue.provider',
    cacheConfig.REDIS_URL ? () => new BullMQQueueProvider() : () => new NoopQueueProvider()
  );
  container.register('token.service', () => new TokenService(authConfig.JWT_SECRET, authConfig.JWT_EXPIRES_IN));
  container.register('password-hasher.service', () => new PasswordHasherService(authConfig.BCRYPT_ROUNDS));
  container.registerSingleton('storage.provider', () => new LocalStorageProvider());
  container.registerSingleton('mailer.service', (c) =>
    new MailerService(c.get('email.provider'), c.get('prisma'), c.get('logger'))
  );

  return container;
}
