import type { PrismaClient } from '@prisma/client';
import type { Order, OrderItem, OrderStatus, OrderStatusHistory } from '@prisma/client';

export interface OrderItemInput {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  items: OrderItemInput[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency?: string;
  note?: string;
  couponCode?: string;
}

export interface OrderWithRelations extends Order {
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  payments?: unknown[];
  shipment?: unknown | null;
}

export interface OrderRepositoryPort {
  create(input: CreateOrderInput): Promise<OrderWithRelations>;
  findById(id: string): Promise<OrderWithRelations | null>;
  findByOrderNumber(orderNumber: string): Promise<OrderWithRelations | null>;
  findByUserId(userId: string): Promise<OrderWithRelations[]>;
  list(filters: { status?: string; search?: string }, page: number, limit: number): Promise<{ orders: OrderWithRelations[]; total: number }>;
  updateStatus(orderId: string, status: OrderStatus, note?: string): Promise<OrderWithRelations>;
  delete(id: string): Promise<void>;
}

const includeAll = {
  items: true,
  statusHistory: { orderBy: { createdAt: 'desc' as const } },
  payments: true,
  shipment: true
} as const;

export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateOrderInput): Promise<OrderWithRelations> {
    const order = await this.prisma.order.create({
      data: {
        orderNumber: input.items.length ? `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` : '',
        userId: input.userId,
        subtotal: input.subtotal,
        shippingAmount: input.shippingAmount,
        taxAmount: input.taxAmount,
        discountAmount: input.discountAmount,
        total: input.total,
        currency: input.currency ?? 'NGN',
        couponCode: input.couponCode ?? null,
        note: input.note ?? null,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
          }))
        },
        statusHistory: {
          create: { status: 'PENDING' }
        }
      },
      include: includeAll
    });
    return order as OrderWithRelations;
  }

  findById(id: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findUnique({ where: { id }, include: includeAll }) as Promise<OrderWithRelations | null>;
  }

  findByOrderNumber(orderNumber: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findUnique({ where: { orderNumber }, include: includeAll }) as Promise<OrderWithRelations | null>;
  }

  findByUserId(userId: string): Promise<OrderWithRelations[]> {
    return this.prisma.order.findMany({ where: { userId }, include: includeAll, orderBy: { placedAt: 'desc' } }) as Promise<OrderWithRelations[]>;
  }

  async list(filters: { status?: string; search?: string }, page: number, limit: number): Promise<{ orders: OrderWithRelations[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.orderNumber = { contains: filters.search };
    }
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: includeAll,
        orderBy: { placedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.order.count({ where })
    ]);
    return { orders: orders as OrderWithRelations[], total };
  }

  async updateStatus(orderId: string, status: OrderStatus, note?: string): Promise<OrderWithRelations> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: includeAll
    });
    await this.prisma.orderStatusHistory.create({
      data: { orderId, status, note: note ?? null }
    });
    return order as OrderWithRelations;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }
}
