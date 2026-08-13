import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaRefundRepository } from './infrastructure/repositories/prisma-refund.repository.js';
import { RefundService } from './application/services/refund.service.js';
import { RefundController } from './presentation/controllers/refund.controller.js';
import { registerRefundRoutes } from './presentation/routes/refund.route.js';

export function registerRefundsModule(container: Container, app: FastifyInstance): void {
  container.register('refund.repository', (c) => new PrismaRefundRepository(c.get('prisma')));
  container.register('refund.service', (c) =>
    new RefundService(
      c.get('refund.repository'),
      c.get('return.repository'),
      c.get('order.service'),
      c.get('user.repository'),
      c.get('mailer.service')
    )
  );
  container.register('refund.controller', (c) => new RefundController(c.get('refund.service')));

  registerRefundRoutes(app, container);
}
