import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaShipmentRepository } from './infrastructure/repositories/prisma-shipment.repository.js';
import { ShippingService } from './application/services/shipping.service.js';
import { ShippingController } from './presentation/controllers/shipping.controller.js';
import { registerShippingRoutes } from './presentation/routes/shipping.route.js';

export function registerShippingModule(container: Container, app: FastifyInstance): void {
  container.register('shipment.repository', (c) => new PrismaShipmentRepository(c.get('prisma')));
  container.register('shipping.service', (c) =>
    new ShippingService(
      c.get('shipment.repository'),
      c.get('order.service'),
      c.get('user.repository'),
      c.get('mailer.service')
    )
  );
  container.register('shipping.controller', (c) => new ShippingController(c.get('shipping.service')));

  registerShippingRoutes(app, container);
}
