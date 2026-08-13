import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaAchievementRepository } from './infrastructure/repositories/prisma-achievement.repository.js';
import { AchievementService } from './application/services/achievement.service.js';
import { AchievementController } from './presentation/controllers/achievement.controller.js';
import { registerAchievementRoutes } from './presentation/routes/achievement.route.js';

export function registerAchievementsModule(container: Container, app: FastifyInstance): void {
  container.register('achievement.repository', (c) => new PrismaAchievementRepository(c.get('prisma')));
  container.register('achievement.service', (c) => new AchievementService(c.get('achievement.repository')));
  container.register('achievement.controller', (c) => new AchievementController(c.get('achievement.service')));

  registerAchievementRoutes(app, container);
}
