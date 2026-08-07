import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaAddressRepository } from './infrastructure/repositories/prisma-address.repository.js';
import { AddressService } from './application/services/address.service.js';
import { AddressController } from './presentation/controllers/address.controller.js';
import { registerAddressRoutes } from './presentation/routes/address.route.js';

export function registerAddressesModule(container: Container, app: FastifyInstance): void {
  container.register('address.repository', (c) => new PrismaAddressRepository(c.get('prisma')));
  container.register('address.service', (c) => new AddressService(c.get('address.repository')));
  container.register('address.controller', (c) => new AddressController(c.get('address.service')));

  registerAddressRoutes(app, container);
}
