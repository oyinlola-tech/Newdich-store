import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaNewsletterRepository } from './infrastructure/repositories/prisma-newsletter.repository.js';
import { NewsletterService } from './application/services/newsletter.service.js';
import { NewsletterController } from './presentation/controllers/newsletter.controller.js';
import { registerNewsletterRoutes } from './presentation/routes/newsletter.route.js';

export function registerNewslettersModule(container: Container, app: FastifyInstance): void {
  container.register('newsletter.repository', (c) => new PrismaNewsletterRepository(c.get('prisma')));
  container.register('newsletter.service', (c) =>
    new NewsletterService(
      c.get('newsletter.repository'),
      c.get('mailer.service'),
      c.get('logger')
    )
  );
  container.register('newsletter.controller', (c) => new NewsletterController(c.get('newsletter.service')));

  registerNewsletterRoutes(app, container);
}
