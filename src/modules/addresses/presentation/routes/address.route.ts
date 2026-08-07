import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { AddressController } from '../controllers/address.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';

export function registerAddressRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<AddressController>('address.controller');
  const auth = authenticate(container);

  app.get('/addresses', { preHandler: [auth] }, controller.list.bind(controller));
  app.post('/addresses', { preHandler: [auth] }, controller.create.bind(controller));
  app.put('/addresses/:id', { preHandler: [auth] }, controller.update.bind(controller));
  app.delete('/addresses/:id', { preHandler: [auth] }, controller.delete.bind(controller));
}
