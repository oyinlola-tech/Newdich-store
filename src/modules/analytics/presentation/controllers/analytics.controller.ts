import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AnalyticsService } from '../../application/services/analytics.service.js';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async stats(_request: FastifyRequest, reply: FastifyReply) {
    const data = await this.analyticsService.stats();
    return reply.send(data);
  }

  async recentOrders(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { limit?: string };
    const limit = Math.min(Number(query.limit ?? 5) || 5, 50);
    const orders = await this.analyticsService.recentOrders(limit);
    return reply.send({ orders });
  }

  async topProducts(_request: FastifyRequest, reply: FastifyReply) {
    const products = await this.analyticsService.topProducts(10);
    return reply.send({ products });
  }

  async topCustomers(_request: FastifyRequest, reply: FastifyReply) {
    const customers = await this.analyticsService.topCustomers(10);
    return reply.send({ customers });
  }

  async salesSeries(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { days?: string };
    const days = Math.min(90, Math.max(7, Number(query.days ?? 30)));
    const series = await this.analyticsService.salesSeries(days);
    return reply.send(series);
  }
}
