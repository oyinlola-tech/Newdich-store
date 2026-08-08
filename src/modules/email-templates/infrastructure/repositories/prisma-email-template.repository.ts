import type { PrismaClient } from '@prisma/client';

export class PrismaEmailTemplateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(where: Record<string, unknown>) {
    return this.prisma.emailTemplate.findMany({ where });
  }

  async create(data: { name: string; subject: string; body: string; category: string }) {
    return this.prisma.emailTemplate.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.prisma.emailTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.emailTemplate.delete({ where: { id } });
  }

  async findUnique(where: { id?: string; name?: string }) {
    return this.prisma.emailTemplate.findUnique({ where: where as never });
  }
}
