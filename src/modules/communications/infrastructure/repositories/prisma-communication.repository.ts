import type { PrismaClient } from '@prisma/client';
import type { CommunicationRepositoryPort } from '../../application/ports/communication.repository.js';
import type { CommunicationCampaign, CommunicationTemplate } from '@prisma/client';

export class PrismaCommunicationRepository implements CommunicationRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async createCampaign(data: Partial<CommunicationCampaign>): Promise<CommunicationCampaign> {
    return this.prisma.communicationCampaign.create({ data: data as never });
  }

  async findCampaigns(filters: { status?: string; type?: string; page: number; limit: number }): Promise<{ campaigns: CommunicationCampaign[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [campaigns, total] = await this.prisma.$transaction([
      this.prisma.communicationCampaign.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }),
      this.prisma.communicationCampaign.count({ where })
    ]);
    return { campaigns, total };
  }

  async findCampaignById(id: string): Promise<CommunicationCampaign | null> {
    return this.prisma.communicationCampaign.findUnique({ where: { id } });
  }

  async updateCampaign(id: string, data: Partial<CommunicationCampaign>): Promise<CommunicationCampaign> {
    return this.prisma.communicationCampaign.update({ where: { id }, data: data as never });
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.prisma.communicationCampaign.delete({ where: { id } });
  }

  async createTemplate(data: Partial<CommunicationTemplate>): Promise<CommunicationTemplate> {
    return this.prisma.communicationTemplate.create({ data: data as never });
  }

  async findTemplates(category?: string): Promise<CommunicationTemplate[]> {
    const where = category ? { category } : {};
    return this.prisma.communicationTemplate.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findTemplateById(id: string): Promise<CommunicationTemplate | null> {
    return this.prisma.communicationTemplate.findUnique({ where: { id } });
  }

  async updateTemplate(id: string, data: Partial<CommunicationTemplate>): Promise<CommunicationTemplate> {
    return this.prisma.communicationTemplate.update({ where: { id }, data: data as never });
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.prisma.communicationTemplate.delete({ where: { id } });
  }
}
