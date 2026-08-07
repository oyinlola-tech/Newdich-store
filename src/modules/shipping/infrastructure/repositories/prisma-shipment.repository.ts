import type { PrismaClient } from '@prisma/client';
import type { Shipment, ShipmentStatus, ShippingMethod } from '@prisma/client';

export interface ShipmentRepositoryPort {
  findByOrderId(orderId: string): Promise<Shipment | null>;
  create(input: {
    orderId: string;
    addressId?: string;
    method: ShippingMethod;
    carrier?: string;
    trackingNumber?: string;
  }): Promise<Shipment>;
  updateStatus(shipmentId: string, status: ShipmentStatus): Promise<Shipment>;
  updateTracking(shipmentId: string, carrier: string, trackingNumber: string): Promise<Shipment>;
  list(page: number, limit: number): Promise<{ shipments: Shipment[]; total: number }>;
}

export class PrismaShipmentRepository implements ShipmentRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findByOrderId(orderId: string): Promise<Shipment | null> {
    return this.prisma.shipment.findUnique({ where: { orderId } });
  }

  async create(input: {
    orderId: string;
    addressId?: string;
    method: ShippingMethod;
    carrier?: string;
    trackingNumber?: string;
  }): Promise<Shipment> {
    return this.prisma.shipment.create({
      data: {
        orderId: input.orderId,
        addressId: input.addressId ?? null,
        method: input.method,
        carrier: input.carrier ?? null,
        trackingNumber: input.trackingNumber ?? null,
        status: 'PROCESSING'
      }
    });
  }

  async updateStatus(shipmentId: string, status: ShipmentStatus): Promise<Shipment> {
    const now = new Date();
    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        shippedAt: status === 'IN_TRANSIT' ? now : undefined,
        deliveredAt: status === 'DELIVERED' ? now : undefined
      }
    });
  }

  async updateTracking(shipmentId: string, carrier: string, trackingNumber: string): Promise<Shipment> {
    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { carrier, trackingNumber, status: 'IN_TRANSIT' }
    });
  }

  async list(page: number, limit: number): Promise<{ shipments: Shipment[]; total: number }> {
    const [shipments, total] = await this.prisma.$transaction([
      this.prisma.shipment.findMany({
        include: { order: { select: { orderNumber: true, status: true, userId: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.shipment.count()
    ]);
    return { shipments, total };
  }
}
