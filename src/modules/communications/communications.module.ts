import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { createCommunicationRoutes } from './presentation/routes/communication.routes.js';
import { PrismaCommunicationRepository } from './infrastructure/repositories/prisma-communication.repository.js';
import { CommunicationService } from './application/services/communication.service.js';
import { CommunicationController } from './presentation/controllers/communication.controller.js';

export function registerCommunicationsModule(container: Container, app: FastifyInstance): void {
  container.register('communication.repository', (c) => new PrismaCommunicationRepository(c.get('prisma')));
  container.register('communication.service', (c) => new CommunicationService(c.get('communication.repository')));
  container.register('communication.controller', (c) => new CommunicationController(c.get('communication.service')));

  const routes = createCommunicationRoutes(container.get('communication.controller'), container);
  app.register(routes, { prefix: '/communications' });
}
