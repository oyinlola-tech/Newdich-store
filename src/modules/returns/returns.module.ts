import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaReturnRepository } from './infrastructure/repositories/prisma-return.repository.js';
import { ReturnService } from './application/services/return.service.js';
import { ReturnController } from './presentation/controllers/return.controller.js';
import { registerReturnRoutes } from './presentation/routes/return.route.js';

export function registerReturnsModule(container: Container, app: FastifyInstance): void {
  container.register('return.repository', (c) => new PrismaReturnRepository(c.get('prisma')));
  container.register('return.service', (c) =>
    new ReturnService(
      c.get('return.repository'),
      c.get('order.service'),
      c.get('user.repository'),
      c.get('mailer.service')
    )
  );
  container.register('return.controller', (c) => new ReturnController(c.get('return.service')));

  registerReturnRoutes(app, container);
}
