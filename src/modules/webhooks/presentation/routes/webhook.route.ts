import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { WebhookController } from '../controllers/webhook.controller.js';
import { registerRawBodyJsonParser } from '../../../../core/infrastructure/http/raw-body.js';

export function registerWebhookRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<WebhookController>('webhook.controller');

  app.register(
    (webhookApp, _opts, done) => {
      registerRawBodyJsonParser(webhookApp);
      webhookApp.post('/webhooks/sendbyte', controller.sendByte.bind(controller));
      done();
    }
  );
}
