import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import { AchievementController } from '../controllers/achievement.controller.js';
import { AchievementService } from '../../application/services/achievement.service.js';
import { PrismaAchievementRepository } from '../../infrastructure/repositories/prisma-achievement.repository.js';
import { requireAuth } from '../../../auth/presentation/guards/auth.guard.js';
import { requireAdmin } from '../../../auth/presentation/guards/admin.guard.js';
import type { TokenService } from '../../../auth/infrastructure/security/token.service.js';

export function registerAchievementRoutes(app: FastifyInstance, container: Container): void {
  const repository = new PrismaAchievementRepository(container.get('prisma'));
  const service = new AchievementService(repository);
  const controller = new AchievementController(service);
  const tokenService = container.get<TokenService>('token.service');
  const authGuard = requireAuth(tokenService);
  const adminGuard = requireAdmin(tokenService);

  app.get('/achievements', { preHandler: authGuard }, controller.list.bind(controller));
  app.get('/achievements/:id', { preHandler: authGuard }, controller.get.bind(controller));
  app.post('/achievements', { preHandler: adminGuard }, controller.create.bind(controller));
  app.put('/achievements/:id', { preHandler: adminGuard }, controller.update.bind(controller));
  app.delete('/achievements/:id', { preHandler: adminGuard }, controller.delete.bind(controller));
  app.get('/users/achievements', { preHandler: authGuard }, controller.getUserAchievements.bind(controller));
}
