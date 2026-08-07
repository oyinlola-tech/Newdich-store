import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaOrderRepository } from './infrastructure/repositories/prisma-order.repository.js';
import { OrderService } from './application/services/order.service.js';
import { OrderController } from './presentation/controllers/order.controller.js';
import { registerOrderRoutes } from './presentation/routes/order.route.js';

export function registerOrdersModule(container: Container, app: FastifyInstance): void {
  container.register('order.repository', (c) => new PrismaOrderRepository(c.get('prisma')));
  container.register('order.service', (c) =>
    new OrderService(
      c.get('order.repository'),
      c.get('user.repository'),
      c.get('mailer.service'),
      c.get('cart.repository')
    )
  );
  container.register('order.controller', (c) => new OrderController(c.get('order.service')));

  registerOrderRoutes(app, container);
}
