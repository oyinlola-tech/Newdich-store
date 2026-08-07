import type { ShipmentRepositoryPort } from '../../infrastructure/repositories/prisma-shipment.repository.js';
import type { MailerService } from '../../../../core/infrastructure/email/mailer.service.js';
import type { UserRepositoryPort } from '../../../users/application/ports/user.repository.js';
import type { OrderService } from '../../../orders/application/services/order.service.js';

export class ShippingService {
  constructor(
    private readonly shipmentRepository: ShipmentRepositoryPort,
    private readonly orderService: OrderService,
    private readonly userRepository: UserRepositoryPort,
    private readonly mailerService: MailerService
  ) {}

  getByOrderId(orderId: string) {
    return this.shipmentRepository.findByOrderId(orderId);
  }

  async createShipment(orderId: string, input: Omit<Parameters<ShipmentRepositoryPort['create']>[0], 'orderId'>) {
    const shipment = await this.shipmentRepository.create({ ...input, orderId });
    await this.notifyShippingUpdate(shipment.orderId, shipment.status, shipment.carrier, shipment.trackingNumber);
    return shipment;
  }

  async updateStatus(shipmentId: string, status: string) {
    const shipment = await this.shipmentRepository.updateStatus(shipmentId, status as never);
    await this.notifyShippingUpdate(shipment.orderId, shipment.status, shipment.carrier, shipment.trackingNumber);
    return shipment;
  }

  async updateTracking(shipmentId: string, carrier: string, trackingNumber: string) {
    const shipment = await this.shipmentRepository.updateTracking(shipmentId, carrier, trackingNumber);
    await this.notifyShippingUpdate(shipment.orderId, shipment.status, shipment.carrier, shipment.trackingNumber);
    return shipment;
  }

  list(page: number, limit: number) {
    return this.shipmentRepository.list(page, limit);
  }

  private async notifyShippingUpdate(
    orderId: string,
    status: string,
    carrier: string | null,
    trackingNumber: string | null
  ): Promise<void> {
    try {
      const order = await this.orderService.getById(orderId);
      if (!order) return;
      const user = await this.userRepository.findById(order.userId);
      if (!user) return;

      await this.mailerService.sendShippingUpdate(
        { email: user.email, name: user.name },
        {
          orderNumber: order.orderNumber,
          status,
          carrier: carrier ?? '—',
          trackingNumber: trackingNumber ?? '—'
        }
      );
    } catch (error) {
      /* shipping notification must never break the shipment flow */
    }
  }
}
