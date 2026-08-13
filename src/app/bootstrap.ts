import { Container } from './container.js';
import { getDatabase } from '../database/database.js';
import { createLogger } from '../core/infrastructure/logger/logger.service.js';
import { CommandBus } from '../core/application/commands/command-bus.js';
import { QueryBus } from '../core/application/queries/query-bus.js';
import { createEmailProvider } from '../integrations/index.js';
import { NoopCacheProvider } from '../core/infrastructure/cache/noop-cache.provider.js';
import { RedisCacheProvider } from '../core/infrastructure/cache/redis-cache.provider.js';
import { BullMQQueueProvider } from '../core/infrastructure/queue/bullmq-queue.provider.js';
import { DatabaseQueueProvider } from '../core/infrastructure/queue/database-queue.provider.js';
import { DatabaseJobProcessor } from '../core/infrastructure/queue/database-job.processor.js';
import { TokenService } from '../modules/auth/infrastructure/security/token.service.js';
import { PasswordHasherService } from '../modules/auth/infrastructure/security/password-hasher.service.js';
import { LocalStorageProvider } from '../core/infrastructure/storage/local-storage.provider.js';
import { MailerService } from '../core/infrastructure/email/mailer.service.js';
import { PrismaRequestLogRepository } from '../modules/request-logs/infrastructure/repositories/prisma-request-log.repository.js';
import { RequestLogService } from '../modules/request-logs/application/services/request-log.service.js';
import { PrismaActivityLogRepository } from '../modules/activity-logs/infrastructure/repositories/prisma-activity-log.repository.js';
import { ActivityLogService } from '../modules/activity-logs/application/services/activity-log.service.js';
import { authConfig, cacheConfig } from '../config/index.js';

export function buildContainer(): Container {
  const container = new Container();

  container.registerSingleton('prisma', () => getDatabase());
  container.registerSingleton('logger', () => createLogger('app'));
  container.registerSingleton('command.bus', () => new CommandBus());
  container.registerSingleton('query.bus', () => new QueryBus());
  container.registerSingleton('email.provider', (c) => createEmailProvider(c.get('logger')));
  container.register('cache.provider', () => cacheConfig.REDIS_URL ? new RedisCacheProvider() : new NoopCacheProvider());
  container.register(
    'queue.provider',
    (c) =>
      cacheConfig.REDIS_URL
        ? new BullMQQueueProvider()
        : new DatabaseQueueProvider(c.get('prisma'))
  );
  container.register('token.service', () => new TokenService(authConfig.JWT_SECRET, authConfig.JWT_EXPIRES_IN));
  container.register('password-hasher.service', () => new PasswordHasherService(authConfig.BCRYPT_ROUNDS));
  container.registerSingleton('storage.provider', () => new LocalStorageProvider());
  container.registerSingleton('mailer.service', (c) =>
    new MailerService(c.get('email.provider'), c.get('prisma'), c.get('logger'))
  );
  container.register('job.processor', (c) =>
    new DatabaseJobProcessor(c.get('prisma'), c.get('logger'))
  );

  container.register('request-log.repository', (c) => new PrismaRequestLogRepository(c.get('prisma')));
  container.register('request-log.service', (c) =>
    new RequestLogService(c.get('request-log.repository'))
  );
  container.register('activity-log.repository', (c) => new PrismaActivityLogRepository(c.get('prisma')));
  container.register('activity-log.service', (c) =>
    new ActivityLogService(c.get('activity-log.repository'))
  );

  return container;
}
