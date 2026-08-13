import type { PrismaClient, NewsletterSubscriber, SubscriberStatus } from '@prisma/client';

export interface NewsletterRepositoryPort {
  findByEmail(email: string): Promise<NewsletterSubscriber | null>;
  findByToken(token: string): Promise<NewsletterSubscriber | null>;
  create(input: { email: string; name?: string; token: string; source: string }): Promise<NewsletterSubscriber>;
  updateStatus(id: string, status: SubscriberStatus): Promise<NewsletterSubscriber>;
  list(filters: { status?: string; search?: string }, page: number, limit: number): Promise<{ subscribers: NewsletterSubscriber[]; total: number }>;
  counts(): Promise<{ subscribed: number; unsubscribed: number }>;
}

export class PrismaNewsletterRepository implements NewsletterRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return this.prisma.newsletterSubscriber.findUnique({ where: { email } });
  }

  findByToken(token: string): Promise<NewsletterSubscriber | null> {
    return this.prisma.newsletterSubscriber.findUnique({ where: { token } });
  }

  create(input: { email: string; name?: string; token: string; source: string }): Promise<NewsletterSubscriber> {
    return this.prisma.newsletterSubscriber.create({
      data: {
      email: input.email,
      name: input.name ?? undefined,
        token: input.token,
        source: input.source,
        subscribedAt: new Date()
      }
    });
  }

  updateStatus(id: string, status: SubscriberStatus): Promise<NewsletterSubscriber> {
    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        status,
        subscribedAt: status === 'SUBSCRIBED' ? new Date() : undefined,
        unsubscribedAt: status === 'UNSUBSCRIBED' ? new Date() : null
      }
    });
  }

  async list(filters: { status?: string; search?: string }, page: number, limit: number): Promise<{ subscribers: NewsletterSubscriber[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search } },
        { name: { contains: filters.search } }
      ];
    }
    const [subscribers, total] = await this.prisma.$transaction([
      this.prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.newsletterSubscriber.count({ where })
    ]);
    return { subscribers, total };
  }

  async counts(): Promise<{ subscribed: number; unsubscribed: number }> {
    const [subscribed, unsubscribed] = await this.prisma.$transaction([
      this.prisma.newsletterSubscriber.count({ where: { status: 'SUBSCRIBED' } }),
      this.prisma.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } })
    ]);
    return { subscribed, unsubscribed };
  }
}
