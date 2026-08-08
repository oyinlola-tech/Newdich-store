import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaEmailTemplateRepository } from './infrastructure/repositories/prisma-email-template.repository.js';
import { EmailTemplateService } from './application/services/email-template.service.js';
import { EmailTemplateController } from './presentation/controllers/email-template.controller.js';
import { EmailController } from './presentation/controllers/email.controller.js';
import { registerEmailTemplateRoutes } from './presentation/routes/email-template.route.js';
import { registerEmailRoutes } from './presentation/routes/email.route.js';

export function registerEmailTemplatesModule(container: Container, app: FastifyInstance): void {
  container.register('email-template.repository', (c) => new PrismaEmailTemplateRepository(c.get('prisma')));
  container.register('email-template.service', (c) =>
    new EmailTemplateService(c.get('email-template.repository'))
  );
  container.register('email-template.controller', (c) =>
    new EmailTemplateController(c.get('email-template.service'))
  );
  container.register('email.controller', () => new EmailController());

  registerEmailTemplateRoutes(app, container);
  registerEmailRoutes(app, container);
}
