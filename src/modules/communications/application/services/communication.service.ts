import type { CommunicationRepositoryPort, CommunicationCampaign, CommunicationTemplate } from '../ports/communication.repository.js';

export class CommunicationService {
  constructor(private readonly repository: CommunicationRepositoryPort) {}

  async createCampaign(data: Partial<CommunicationCampaign>): Promise<CommunicationCampaign> {
    return this.repository.createCampaign(data);
  }

  async getCampaigns(filters: { status?: string; type?: string; page: number; limit: number }): Promise<{ campaigns: CommunicationCampaign[]; total: number }> {
    return this.repository.findCampaigns(filters);
  }

  async getCampaignById(id: string): Promise<CommunicationCampaign | null> {
    return this.repository.findCampaignById(id);
  }

  async updateCampaign(id: string, data: Partial<CommunicationCampaign>): Promise<CommunicationCampaign> {
    return this.repository.updateCampaign(id, data);
  }

  async deleteCampaign(id: string): Promise<void> {
    return this.repository.deleteCampaign(id);
  }

  async createTemplate(data: Partial<CommunicationTemplate>): Promise<CommunicationTemplate> {
    return this.repository.createTemplate(data);
  }

  async getTemplates(category?: string): Promise<CommunicationTemplate[]> {
    return this.repository.findTemplates(category);
  }

  async getTemplateById(id: string): Promise<CommunicationTemplate | null> {
    return this.repository.findTemplateById(id);
  }

  async updateTemplate(id: string, data: Partial<CommunicationTemplate>): Promise<CommunicationTemplate> {
    return this.repository.updateTemplate(id, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.repository.deleteTemplate(id);
  }
}
