import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaTaxRuleRepository } from './infrastructure/repositories/prisma-tax-rule.repository.js';
import { TaxService } from './application/services/tax.service.js';
import { TaxController } from './presentation/controllers/tax.controller.js';
import { registerTaxRoutes } from './presentation/routes/tax.route.js';

export function registerTaxModule(container: Container, app: FastifyInstance): void {
  container.register('tax.repository', (c) => new PrismaTaxRuleRepository(c.get('prisma')));
  container.register('tax.service', (c) => new TaxService(c.get('tax.repository')));
  container.register('tax.controller', (c) => new TaxController(c.get('tax.service')));

  registerTaxRoutes(app, container);
}
