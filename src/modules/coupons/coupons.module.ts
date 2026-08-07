import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaCouponRepository } from './infrastructure/repositories/prisma-coupon.repository.js';
import { CouponService } from './application/services/coupon.service.js';
import { CouponController } from './presentation/controllers/coupon.controller.js';
import { registerCouponRoutes } from './presentation/routes/coupon.route.js';

export function registerCouponsModule(container: Container, app: FastifyInstance): void {
  container.register('coupon.repository', (c) => new PrismaCouponRepository(c.get('prisma')));
  container.register('coupon.service', (c) => new CouponService(c.get('coupon.repository')));
  container.register('coupon.controller', (c) => new CouponController(c.get('coupon.service')));

  registerCouponRoutes(app, container);
}
