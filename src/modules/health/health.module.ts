import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import type { PrismaClient } from '@prisma/client';
import { createLogger } from '../../core/infrastructure/logger/logger.service.js';

export function registerHealthModule(container: Container, app: FastifyInstance): void {
  const prisma = container.get<PrismaClient>('prisma');
  const logger = container.get<ReturnType<typeof createLogger>>('logger');

  app.get('/health', async (_request, reply) => {
    return reply.send({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/health/live', async (_request, reply) => {
    return reply.send({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/health/ready', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({ status: 'ok', database: 'connected' });
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      return reply.status(503).send({ status: 'error', database: 'disconnected' });
    }
  });
}
