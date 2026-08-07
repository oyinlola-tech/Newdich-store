import type { PrismaClient } from '@prisma/client';
import type { ContactMessage, ContactStatus } from '@prisma/client';

export interface ContactRepositoryPort {
  create(input: { name: string; email: string; subject: string; message: string }): Promise<ContactMessage>;
  list(filters: { status?: string; search?: string }, page: number, limit: number): Promise<{ messages: ContactMessage[]; total: number }>;
  findById(id: string): Promise<ContactMessage | null>;
  updateStatus(id: string, status: ContactStatus): Promise<ContactMessage>;
  reply(id: string, reply: string): Promise<ContactMessage>;
  countUnread(): Promise<number>;
}

export class PrismaContactRepository implements ContactRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: { name: string; email: string; subject: string; message: string }): Promise<ContactMessage> {
    return this.prisma.contactMessage.create({ data: input });
  }

  async list(filters: { status?: string; search?: string }, page: number, limit: number): Promise<{ messages: ContactMessage[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { subject: { contains: filters.search } }
      ];
    }
    const [messages, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.contactMessage.count({ where })
    ]);
    return { messages, total };
  }

  findById(id: string): Promise<ContactMessage | null> {
    return this.prisma.contactMessage.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: ContactStatus): Promise<ContactMessage> {
    return this.prisma.contactMessage.update({ where: { id }, data: { status } });
  }

  async reply(id: string, reply: string): Promise<ContactMessage> {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { reply, status: 'REPLIED', repliedAt: new Date() }
    });
  }

  countUnread(): Promise<number> {
    return this.prisma.contactMessage.count({ where: { status: 'NEW' } });
  }
}
