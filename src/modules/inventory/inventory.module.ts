import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaInventoryRepository } from './infrastructure/repositories/prisma-inventory.repository.js';
import { InventoryService } from './application/services/inventory.service.js';
import { InventoryController } from './presentation/controllers/inventory.controller.js';
import { registerInventoryRoutes } from './presentation/routes/inventory.route.js';

export function registerInventoryModule(container: Container, app: FastifyInstance): void {
  container.register('inventory.repository', (c) => new PrismaInventoryRepository(c.get('prisma')));
  container.register('inventory.service', (c) => new InventoryService(c.get('inventory.repository')));
  container.register('inventory.controller', (c) => new InventoryController(c.get('inventory.service')));

  registerInventoryRoutes(app, container);
}
