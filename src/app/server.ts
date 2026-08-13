import { createApp } from './app.js';
import { appConfig } from '../config/index.js';
import type { AppLogger } from '../core/infrastructure/logger/logger.service.js';

export async function startServer(): Promise<void> {
  const { app, container } = await createApp();
  const logger = container.get<AppLogger>('logger');

  const jobProcessor = container.get<import('../core/infrastructure/queue/database-job.processor.js').DatabaseJobProcessor>('job.processor');

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  try {
    await app.listen({ port: appConfig.PORT, host: appConfig.HOST });
    logger.info({ port: appConfig.PORT, api: appConfig.API_PREFIX, docs: 'http://localhost:' + appConfig.PORT + '/docs' }, 'server started');

    setInterval(async () => {
      try {
        await jobProcessor.processPendingJobs();
      } catch (error) {
        logger.error(error, 'failed to process pending jobs');
      }
    }, 5 * 60 * 1000);
  } catch (error) {
    logger.error(error, 'failed to start server');
    process.exit(1);
  }
}
