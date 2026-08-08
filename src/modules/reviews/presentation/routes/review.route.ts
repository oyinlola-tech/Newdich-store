import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { ReviewController } from '../controllers/review.controller.js';
import { authenticate } from '../../../auth/presentation/guards/auth.guard.js';
import { adminPermission, isAdmin } from '../../../auth/presentation/guards/admin.guard.js';

export function registerReviewRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<ReviewController>('review.controller');
  const auth = authenticate(container);
  const admin = isAdmin(container);

  app.get('/products/:productId/reviews', controller.listByProduct.bind(controller));
  app.post('/products/:productId/reviews', { preHandler: [auth] }, controller.create.bind(controller));
  app.get('/reviews/me', { preHandler: [auth] }, controller.listByUser.bind(controller));
  app.get('/admin/reviews', { preHandler: [admin] }, controller.adminList.bind(controller));
  app.delete('/admin/reviews/:id', { preHandler: adminPermission(container, 'reviews.manage') }, controller.remove.bind(controller));
}
