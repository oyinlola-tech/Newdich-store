import type { PrismaClient } from '@prisma/client';
import type { AchievementRepositoryPort } from '../../application/ports/achievement.repository.js';

export class PrismaAchievementRepository implements AchievementRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<any[]> {
    const achievements = await this.prisma.achievement.findMany({ orderBy: { createdAt: 'desc' } });
    return achievements.map(a => this.toEntity(a));
  }

  async findById(id: string): Promise<any | null> {
    const achievement = await this.prisma.achievement.findUnique({ where: { id } });
    return achievement ? this.toEntity(achievement) : null;
  }

  async create(data: { name: string; description?: string | null; type: string; threshold: number }): Promise<any> {
    const achievement = await this.prisma.achievement.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type as any,
        threshold: data.threshold
      }
    });
    return this.toEntity(achievement);
  }

  async update(id: string, data: { name?: string; description?: string | null; threshold?: number; isActive?: boolean }): Promise<any> {
    const achievement = await this.prisma.achievement.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.threshold !== undefined && { threshold: data.threshold }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      }
    });
    return this.toEntity(achievement);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.achievement.delete({ where: { id } });
  }

  async findActiveByType(type: string): Promise<any[]> {
    const achievements = await this.prisma.achievement.findMany({
      where: { type: type as any, isActive: true }
    });
    return achievements.map(a => this.toEntity(a));
  }

  async findUserAchievement(userId: string, achievementId: string): Promise<any | null> {
    const ua = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } }
    });
    return ua ? this.toUserAchievementEntity(ua) : null;
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<any> {
    const ua = await this.prisma.userAchievement.create({
      data: { userId, achievementId }
    });
    return this.toUserAchievementEntity(ua);
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    const uas = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    });
    return uas.map(ua => this.toUserAchievementEntity(ua));
  }

  async markAsNotified(id: string): Promise<void> {
    await this.prisma.userAchievement.update({
      where: { id },
      data: { notified: true }
    });
  }

  async addCoupon(achievementId: string, couponId: string): Promise<any> {
    const ac = await this.prisma.achievementCoupon.create({
      data: { achievementId, couponId }
    });
    return this.toAchievementCouponEntity(ac);
  }

  async removeCoupon(achievementId: string, couponId: string): Promise<void> {
    await this.prisma.achievementCoupon.delete({
      where: { achievementId_couponId: { achievementId, couponId } }
    });
  }

  async getCoupons(achievementId: string): Promise<any[]> {
    const acs = await this.prisma.achievementCoupon.findMany({
      where: { achievementId }
    });
    return acs.map(ac => this.toAchievementCouponEntity(ac));
  }

  private toEntity(a: any): any {
    return {
      id: a.id,
      name: a.name,
      description: a.description,
      type: a.type,
      threshold: a.threshold,
      isActive: a.isActive,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    };
  }

  private toUserAchievementEntity(ua: any): any {
    return {
      id: ua.id,
      userId: ua.userId,
      achievementId: ua.achievementId,
      unlockedAt: ua.unlockedAt,
      notified: ua.notified
    };
  }

  private toAchievementCouponEntity(ac: any): any {
    return {
      id: ac.id,
      achievementId: ac.achievementId,
      couponId: ac.couponId
    };
  }
}
