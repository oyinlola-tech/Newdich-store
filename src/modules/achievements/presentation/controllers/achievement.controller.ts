import type { FastifyReply, FastifyRequest } from 'fastify';
import { AchievementService } from '../../application/services/achievement.service.js';

export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const achievements = await this.achievementService.listAchievements();
    return reply.send({ achievements });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const achievement = await this.achievementService.getAchievement(id);
    if (!achievement) {
      return reply.status(404).send({ message: 'Achievement not found.' });
    }
    return reply.send({ achievement });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as { name: string; description?: string; type: string; threshold: number };
    const achievement = await this.achievementService.createAchievement(data);
    return reply.status(201).send({ achievement });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = request.body as { name?: string; description?: string; threshold?: number; isActive?: boolean };
    const achievement = await this.achievementService.updateAchievement(id, data);
    return reply.send({ achievement });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.achievementService.deleteAchievement(id);
    return reply.send({ message: 'Achievement deleted successfully.' });
  }

  async getUserAchievements(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const achievements = await this.achievementService.getUserAchievements(userId);
    return reply.send({ achievements });
  }
}
