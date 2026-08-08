import type { PrismaClient } from '@prisma/client';

export class EmailTemplateService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(category?: string) {
    const where = category ? { category } : {};
    return this.prisma.emailTemplate.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(input: { name: string; subject: string; body: string; category: string }) {
    return this.prisma.emailTemplate.create({ data: input });
  }

  async update(id: string, input: { name?: string; subject?: string; body?: string; category?: string; isActive?: boolean }) {
    return this.prisma.emailTemplate.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    return this.prisma.emailTemplate.delete({ where: { id } });
  }

  async findByName(name: string) {
    return this.prisma.emailTemplate.findUnique({ where: { name } });
  }
}
