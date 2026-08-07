import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { CouponController } from '../controllers/coupon.controller.js';
import { isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerCouponRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<CouponController>('coupon.controller');
  const admin = isAdmin(container);

  app.get('/coupons/validate', controller.validate.bind(controller));
  app.get('/admin/coupons', { preHandler: [admin] }, controller.list.bind(controller));
  app.post('/admin/coupons', { preHandler: [admin] }, controller.create.bind(controller));
  app.put('/admin/coupons/:id', { preHandler: [admin] }, controller.update.bind(controller));
  app.delete('/admin/coupons/:id', { preHandler: [admin] }, controller.remove.bind(controller));
}
