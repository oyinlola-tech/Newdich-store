export class Achievement {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly type: 'ORDERS' | 'ANNIVERSARY' | 'BIRTHDAY' | 'CUSTOM',
    public readonly threshold: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class UserAchievement {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly achievementId: string,
    public readonly unlockedAt: Date,
    public readonly notified: boolean
  ) {}
}

export class AchievementCoupon {
  constructor(
    public readonly id: string,
    public readonly achievementId: string,
    public readonly couponId: string
  ) {}
}
