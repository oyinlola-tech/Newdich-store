import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildContainer } from './bootstrap.js';
import { registerRoutes } from './routes.js';
import { registerErrorHandler } from '../core/infrastructure/http/error.handler.js';
import { registerSwagger } from '../docs/swagger.js';
import { appConfig } from '../config/index.js';
import type { AppLogger } from '../core/infrastructure/logger/logger.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function createApp(): Promise<{ app: FastifyInstance; container: ReturnType<typeof buildContainer> }> {
  const app = Fastify({
    logger: false,
    bodyLimit: appConfig.MAX_UPLOAD_MB * 1024 * 1024 + 1024 * 1024
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: appConfig.CORS_ORIGIN === '*' ? true : appConfig.CORS_ORIGIN.split(',')
  });
  await app.register(sensible);
  await app.register(multipart, {
    limits: { fileSize: appConfig.MAX_UPLOAD_MB * 1024 * 1024, files: 10 }
  });
  await app.register(rateLimit, {
    global: true,
    max: appConfig.RATE_LIMIT_MAX,
    timeWindow: appConfig.RATE_LIMIT_WINDOW_MS
  });

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', '..', appConfig.UPLOADS_DIR),
    prefix: '/uploads/'
  });

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', '..', 'public'),
    prefix: '/'
  });

  await registerSwagger(app);

  const container = buildContainer();
  const logger = container.get<AppLogger>('logger');

  registerErrorHandler(app, logger);
  await app.register(
    (api, _opts, done) => {
      registerRoutes(api, container);
      done();
    },
    { prefix: appConfig.API_PREFIX }
  );

  return { app, container };
}
