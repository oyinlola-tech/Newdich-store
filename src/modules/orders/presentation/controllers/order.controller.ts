import type { FastifyReply, FastifyRequest } from 'fastify';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
import type { OrderService } from '../../application/services/order.service.js';

const allowedStatuses = ['PENDING', 'PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  async listMine(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const orders = await this.orderService.listByUser(userId);
    return reply.send({ orders: orders.map(toOrderOutput) });
  }

  async getMine(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const order = await this.orderService.getById(id);
    if (!order || order.userId !== userId) {
      return reply.status(404).send({ message: 'Order not found.' });
    }
    return reply.send({ order: toOrderOutput(order) });
  }

  async createCustomerOrder(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const body = request.body as {
      shippingAddress?: Record<string, unknown>;
      items?: { productId: string; name?: string; quantity?: number; price?: number }[];
      total?: number;
      payment?: { paymentId?: string; status?: string };
      note?: string;
    };

    if (!Array.isArray(body.items) || body.items.length === 0 || typeof body.total !== 'number') {
      return reply.status(400).send({ message: 'items and total are required.' });
    }

    const order = await this.orderService.createCustomerOrder(userId, body);
    return reply.status(201).send({ order: toOrderOutput(order) });
  }

  async adminAddNote(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { note?: string };
    if (!body.note || typeof body.note !== 'string' || body.note.trim().length === 0) {
      return reply.status(400).send({ message: 'note is required.' });
    }
    const order = await this.orderService.addNote(id, body.note.trim());
    return reply.send({ order: toOrderOutput(order), message: 'Note added.' });
  }

  async adminStatusHistory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const order = await this.orderService.getById(id);
    if (!order) {
      return reply.status(404).send({ message: 'Order not found.' });
    }
    return reply.send({ history: order.statusHistory });
  }

  async track(request: FastifyRequest, reply: FastifyReply) {
    const { orderNumber } = request.params as { orderNumber: string };
    const order = await this.orderService.getByNumber(orderNumber);
    if (!order) {
      return reply.status(404).send({ message: 'Order not found.' });
    }
    return reply.send({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        placedAt: order.placedAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({ name: item.name, quantity: item.quantity })),
        shipmentStatus: order.shipment ? (order.shipment as { status?: string }).status ?? null : null
      }
    });
  }

  async adminList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { status?: string; search?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.orderService.list(
      { status: query.status, search: query.search?.trim() },
      page,
      limit
    );
    return reply.send({ orders: result.orders.map(toOrderOutput), total: result.total, page, limit });
  }

  async adminGet(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const order = await this.orderService.getById(id);
    if (!order) {
      return reply.status(404).send({ message: 'Order not found.' });
    }
    return reply.send({ order: toOrderOutput(order) });
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string; note?: string };
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return reply.status(400).send({ message: `status must be one of: ${allowedStatuses.join(', ')}.` });
    }
    const order = await this.orderService.updateStatus(id, body.status, body.note);
    return reply.send({ order: toOrderOutput(order) });
  }
}

function toOrderOutput(order: {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: unknown;
  discountAmount: unknown;
  taxAmount: unknown;
  shippingAmount: unknown;
  total: unknown;
  currency: string;
  placedAt: Date;
  items: { id: string; productId: string; variantId: string | null; name: string; price: unknown; quantity: number; total: unknown }[];
  statusHistory: { id: string; status: string; note: string | null; createdAt: Date }[];
  shipment?: unknown | null;
  payments?: unknown[];
  note?: string | null;
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    taxAmount: order.taxAmount,
    shippingAmount: order.shippingAmount,
    total: order.total,
    currency: order.currency,
    placedAt: order.placedAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.total
    })),
    statusHistory: order.statusHistory,
    note: order.note
  };
}
