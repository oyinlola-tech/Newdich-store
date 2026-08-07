import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaContactRepository } from './infrastructure/repositories/prisma-contact.repository.js';
import { ContactService } from './application/services/contact.service.js';
import { ContactController } from './presentation/controllers/contact.controller.js';
import { registerContactRoutes } from './presentation/routes/contact.route.js';

export function registerContactModule(container: Container, app: FastifyInstance): void {
  container.register('contact.repository', (c) => new PrismaContactRepository(c.get('prisma')));
  container.register('contact.service', (c) =>
    new ContactService(c.get('contact.repository'), c.get('mailer.service'))
  );
  container.register('contact.controller', (c) => new ContactController(c.get('contact.service')));

  registerContactRoutes(app, container);
}
