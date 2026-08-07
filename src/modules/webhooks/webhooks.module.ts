import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { WebhookController } from './presentation/controllers/webhook.controller.js';
import { registerWebhookRoutes } from './presentation/routes/webhook.route.js';
import { emailConfig } from '../../config/index.js';

export function registerWebhooksModule(container: Container, app: FastifyInstance): void {
  container.register('webhook.controller', (c) =>
    new WebhookController(c.get('mailer.service'), emailConfig.SEND_BYTE_WEBHOOK_SECRET ?? '')
  );

  registerWebhookRoutes(app, container);
}
