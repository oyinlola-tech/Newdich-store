export interface CommunicationCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  audience: string;
  subject: string;
  body: string;
  templateId: string | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunicationRepositoryPort {
  createCampaign(data: Partial<CommunicationCampaign>): Promise<CommunicationCampaign>;
  findCampaigns(filters: { status?: string; type?: string; page: number; limit: number }): Promise<{ campaigns: CommunicationCampaign[]; total: number }>;
  findCampaignById(id: string): Promise<CommunicationCampaign | null>;
  updateCampaign(id: string, data: Partial<CommunicationCampaign>): Promise<CommunicationCampaign>;
  deleteCampaign(id: string): Promise<void>;

  createTemplate(data: Partial<CommunicationTemplate>): Promise<CommunicationTemplate>;
  findTemplates(category?: string): Promise<CommunicationTemplate[]>;
  findTemplateById(id: string): Promise<CommunicationTemplate | null>;
  updateTemplate(id: string, data: Partial<CommunicationTemplate>): Promise<CommunicationTemplate>;
  deleteTemplate(id: string): Promise<void>;
}
