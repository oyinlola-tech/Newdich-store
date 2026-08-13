import type { FastifyInstance } from 'fastify';
import { CommunicationController } from '../controllers/communication.controller.js';
import type { Container } from '../../../../app/container.js';
import { isAdmin } from '../../../../modules/auth/presentation/guards/admin.guard.js';

export function createCommunicationRoutes(controller: CommunicationController, container: Container) {
  const admin = isAdmin(container);
  return function (app: FastifyInstance) {
    app.get('/campaigns', { preHandler: [admin] }, controller.getCampaigns);
    app.get('/campaigns/:id', { preHandler: [admin] }, controller.getCampaign);
    app.post('/campaigns', { preHandler: [admin] }, controller.createCampaign);
    app.put('/campaigns/:id', { preHandler: [admin] }, controller.updateCampaign);
    app.delete('/campaigns/:id', { preHandler: [admin] }, controller.deleteCampaign);

    app.get('/templates', { preHandler: [admin] }, controller.getTemplates);
    app.get('/templates/:id', { preHandler: [admin] }, controller.getTemplate);
    app.post('/templates', { preHandler: [admin] }, controller.createTemplate);
    app.put('/templates/:id', { preHandler: [admin] }, controller.updateTemplate);
    app.delete('/templates/:id', { preHandler: [admin] }, controller.deleteTemplate);
  };
}
