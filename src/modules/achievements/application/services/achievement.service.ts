import type { AchievementRepositoryPort } from '../ports/achievement.repository.js';

export class AchievementService {
  constructor(private readonly achievementRepository: AchievementRepositoryPort) {}

  async listAchievements() {
    return this.achievementRepository.findAll();
  }

  async getAchievement(id: string) {
    return this.achievementRepository.findById(id);
  }

  async createAchievement(data: { name: string; description?: string | null; type: string; threshold: number }) {
    return this.achievementRepository.create(data);
  }

  async updateAchievement(id: string, data: { name?: string; description?: string | null; threshold?: number; isActive?: boolean }) {
    return this.achievementRepository.update(id, data);
  }

  async deleteAchievement(id: string) {
    return this.achievementRepository.delete(id);
  }

  async checkAndUnlock(userId: string, type: string, count: number): Promise<any | null> {
    const achievements = await this.achievementRepository.findActiveByType(type);
    for (const achievement of achievements) {
      if (count >= achievement.threshold) {
        const existing = await this.achievementRepository.findUserAchievement(userId, achievement.id);
        if (!existing) {
          return this.achievementRepository.unlockAchievement(userId, achievement.id);
        }
      }
    }
    return null;
  }

  async getUserAchievements(userId: string) {
    return this.achievementRepository.getUserAchievements(userId);
  }

  async markNotified(id: string) {
    return this.achievementRepository.markAsNotified(id);
  }

  async addCoupon(achievementId: string, couponId: string) {
    return this.achievementRepository.addCoupon(achievementId, couponId);
  }

  async removeCoupon(achievementId: string, couponId: string) {
    return this.achievementRepository.removeCoupon(achievementId, couponId);
  }

  async getCoupons(achievementId: string) {
    return this.achievementRepository.getCoupons(achievementId);
  }
}
