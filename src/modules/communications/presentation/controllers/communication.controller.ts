import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CommunicationService } from '../../application/services/communication.service.js';

const CreateCampaignSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  audience: z.string().min(2),
  subject: z.string().min(2),
  body: z.string().min(1),
  templateId: z.string().optional(),
  scheduledAt: z.string().optional(),
  status: z.string().optional()
});

const CreateTemplateSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  subject: z.string().min(2),
  body: z.string().min(1),
  isActive: z.boolean().optional()
});

export class CommunicationController {
  constructor(private readonly service: CommunicationService) {}

  getCampaigns = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const status = (request.query as any)?.status as string | undefined;
      const type = (request.query as any)?.type as string | undefined;
      const page = parseInt((request.query as any)?.page as string) || 1;
      const limit = parseInt((request.query as any)?.limit as string) || 20;
      const result = await this.service.getCampaigns({ status, type, page, limit });
      return { success: true, data: result };
    } catch (error) {
      return reply.status(500).send({ success: false, message: 'Failed to fetch campaigns', error: (error as Error).message });
    }
  };

  getCampaign = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const campaign = await this.service.getCampaignById((request.params as any).id);
      if (!campaign) return reply.status(404).send({ success: false, message: 'Campaign not found' });
      return { success: true, data: campaign };
    } catch (error) {
      return reply.status(500).send({ success: false, message: 'Failed to fetch campaign', error: (error as Error).message });
    }
  };

  createCampaign = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = CreateCampaignSchema.parse(request.body);
      const campaignData = {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        createdBy: (request as any).user?.id || 'system'
      };
      const campaign = await this.service.createCampaign(campaignData);
      return reply.status(201).send({ success: true, data: campaign });
    } catch (error) {
      if (error instanceof z.ZodError) return reply.status(400).send({ success: false, message: 'Validation failed', errors: (error as any).errors });
      return reply.status(500).send({ success: false, message: 'Failed to create campaign', error: (error as Error).message });
    }
  };

  updateCampaign = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = (CreateCampaignSchema.partial() as any).parse(request.body);
      const campaign = await this.service.updateCampaign((request.params as any).id, data);
      return { success: true, data: campaign };
    } catch (error) {
      if (error instanceof z.ZodError) return reply.status(400).send({ success: false, message: 'Validation failed', errors: (error as any).errors });
      return reply.status(500).send({ success: false, message: 'Failed to update campaign', error: (error as Error).message });
    }
  };

  deleteCampaign = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await this.service.deleteCampaign((request.params as any).id);
      return { success: true, message: 'Campaign deleted successfully' };
    } catch (error) {
      return reply.status(500).send({ success: false, message: 'Failed to delete campaign', error: (error as Error).message });
    }
  };

  getTemplates = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const category = (request.query as any)?.category as string | undefined;
      const templates = await this.service.getTemplates(category);
      return { success: true, data: templates };
    } catch (error) {
      return reply.status(500).send({ success: false, message: 'Failed to fetch templates', error: (error as Error).message });
    }
  };

  getTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const template = await this.service.getTemplateById((request.params as any).id);
      if (!template) return reply.status(404).send({ success: false, message: 'Template not found' });
      return { success: true, data: template };
    } catch (error) {
      return reply.status(500).send({ success: false, message: 'Failed to fetch template', error: (error as Error).message });
    }
  };

  createTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = CreateTemplateSchema.parse(request.body);
      const template = await this.service.createTemplate(data);
      return reply.status(201).send({ success: true, data: template });
    } catch (error) {
      if (error instanceof z.ZodError) return reply.status(400).send({ success: false, message: 'Validation failed', errors: (error as any).errors });
      return reply.status(500).send({ success: false, message: 'Failed to create template', error: (error as Error).message });
    }
  };

  updateTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = (CreateTemplateSchema.partial() as any).parse(request.body);
      const template = await this.service.updateTemplate((request.params as any).id, data);
      return { success: true, data: template };
    } catch (error) {
      if (error instanceof z.ZodError) return reply.status(400).send({ success: false, message: 'Validation failed', errors: (error as any).errors });
      return reply.status(500).send({ success: false, message: 'Failed to update template', error: (error as Error).message });
    }
  };

  deleteTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await this.service.deleteTemplate((request.params as any).id);
      return { success: true, message: 'Template deleted successfully' };
    } catch (error) {
      return reply.status(500).send({ success: false, message: 'Failed to delete template', error: (error as Error).message });
    }
  };
}
