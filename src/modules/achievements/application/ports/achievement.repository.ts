import type { Achievement, UserAchievement, AchievementCoupon } from '../../domain/entities/achievement.entity.js';

export interface AchievementRepositoryPort {
  findAll(): Promise<Achievement[]>;
  findById(id: string): Promise<Achievement | null>;
  create(data: { name: string; description?: string | null; type: string; threshold: number }): Promise<Achievement>;
  update(id: string, data: { name?: string; description?: string | null; threshold?: number; isActive?: boolean }): Promise<Achievement>;
  delete(id: string): Promise<void>;
  findActiveByType(type: string): Promise<Achievement[]>;
  findUserAchievement(userId: string, achievementId: string): Promise<UserAchievement | null>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  markAsNotified(id: string): Promise<void>;
  addCoupon(achievementId: string, couponId: string): Promise<AchievementCoupon>;
  removeCoupon(achievementId: string, couponId: string): Promise<void>;
  getCoupons(achievementId: string): Promise<AchievementCoupon[]>;
}
