import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { buildContainer } from './bootstrap.js';
import { registerRoutes } from './routes.js';
import { registerStaticRoutes } from './static-routes.js';
import { registerErrorHandler } from '../core/infrastructure/http/error.handler.js';
import { registerSwagger } from '../docs/swagger.js';
import { smartRateLimit } from '../core/infrastructure/http/rate-limit.middleware.js';
import { appConfig } from '../config/index.js';
import type { AppLogger } from '../core/infrastructure/logger/logger.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', '..', 'public');

export async function createApp(): Promise<{ app: FastifyInstance; container: ReturnType<typeof buildContainer> }> {
  const app = Fastify({
    logger: false,
    bodyLimit: appConfig.MAX_UPLOAD_MB * 1024 * 1024 + 1024 * 1024
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  if (appConfig.NODE_ENV === 'production' && appConfig.CORS_ORIGIN === '*') {
    throw new Error('CORS_ORIGIN must not be "*" in production');
  }
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
    timeWindow: appConfig.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: (_request, _context) => ({
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' }
    })
  });

  app.addHook('preHandler', smartRateLimit());

  app.addHook('onSend', async (request, reply, payload) => {
    if (reply.statusCode === 429) {
      const accept = request.headers.accept;
      if (!accept || accept === '' || accept.includes('text/html') || accept.includes('*/*')) {
        try {
          const html = readFileSync(join(PUBLIC_DIR, 'errors/429.html'), 'utf-8');
          reply.type('text/html');
          return html;
        } catch {
          return payload;
        }
      }
    }
    return payload;
  });

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', '..', appConfig.UPLOADS_DIR),
    prefix: '/uploads/',
    decorateReply: false
  });

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', '..', 'public'),
    prefix: '/',
    decorateReply: false
  });

  await registerSwagger(app);

  const container = buildContainer();
  const logger = container.get<AppLogger>('logger');

  registerErrorHandler(app, logger);

  await registerStaticRoutes(app);

  const requestLogService = container.get<import('../modules/request-logs/application/services/request-log.service.js').RequestLogService>('request-log.service');
  const activityLogService = container.get<import('../modules/activity-logs/application/services/activity-log.service.js').ActivityLogService>('activity-log.service');

  app.addHook('onResponse', async (request, reply) => {
    try {
      const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
        const userAgent = request.headers['user-agent'] ?? undefined;
        const userId = request.user?.id ?? undefined;
      const rawUrl = typeof request.raw?.url === 'string' ? request.raw.url : (typeof request.url === 'string' ? request.url : '/');
      const path = rawUrl.split('?')[0] || '/';
      const method = request.method ?? 'GET';
      const status = reply.statusCode;

      await requestLogService.log({ ip, path, method, status, userId, userAgent });
    } catch {
      // never break the response because of logging
    }
  });

  app.addHook('onSend', async (request, _reply, payload) => {
    try {
      const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
      const userId = request.user?.id ?? undefined;
      const userAgent = request.headers['user-agent'] ?? undefined;
      const rawUrl = typeof request.raw?.url === 'string' ? request.raw.url : (typeof request.url === 'string' ? request.url : '/');
      const path = rawUrl.split('?')[0] || '/';
      const status = _reply.statusCode;

      if (status >= 200 && status < 400) {
        await activityLogService.log({
          actorType: userId ? 'USER' : 'GUEST',
          actorId: userId ?? undefined,
          action: `${request.method ?? 'GET'} ${path}`,
          targetType: 'route',
          targetId: path,
          ip,
          userAgent
        });
      }
    } catch {
      // never break the response because of logging
    }
    return payload;
  });

  await app.register(
    (api, _opts, done) => {
      registerRoutes(api, container);
      done();
    },
    { prefix: appConfig.API_PREFIX }
  );

  return { app, container };
}
