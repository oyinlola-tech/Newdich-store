import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { ShippingService } from '../../application/services/shipping.service.js';

const shipmentStatuses = ['PENDING', 'PROCESSING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'];

export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  async getByOrder(request: FastifyRequest, reply: FastifyReply) {
    const { orderId } = request.params as { orderId: string };
    const shipment = await this.shippingService.getByOrderId(orderId);
    if (!shipment) {
      return reply.status(404).send({ message: 'Shipment not found.' });
    }
    return reply.send({ shipment });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      orderId?: string;
      addressId?: string;
      method?: 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
      carrier?: string;
      trackingNumber?: string;
    };
    if (!body.orderId) {
      return reply.status(400).send({ message: 'orderId is required.' });
    }
    const existing = await this.shippingService.getByOrderId(body.orderId);
    if (existing) {
      return reply.status(400).send({ message: 'Shipment already exists for this order.' });
    }
    const shipment = await this.shippingService.createShipment(body.orderId, {
      addressId: body.addressId,
      method: body.method ?? 'STANDARD',
      carrier: body.carrier,
      trackingNumber: body.trackingNumber
    });
    return reply.status(201).send({ shipment });
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string };
    if (!body.status || !shipmentStatuses.includes(body.status)) {
      return reply.status(400).send({ message: `status must be one of: ${shipmentStatuses.join(', ')}.` });
    }
    const shipment = await this.shippingService.updateStatus(id, body.status);
    return reply.send({ shipment });
  }

  async updateTracking(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { carrier?: string; trackingNumber?: string };
    if (!body.carrier || !body.trackingNumber) {
      return reply.status(400).send({ message: 'carrier and trackingNumber are required.' });
    }
    const shipment = await this.shippingService.updateTracking(id, body.carrier, body.trackingNumber);
    return reply.send({ shipment });
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.shippingService.list(page, limit);
    return reply.send({ shipments: result.shipments, total: result.total, page, limit });
  }
}
