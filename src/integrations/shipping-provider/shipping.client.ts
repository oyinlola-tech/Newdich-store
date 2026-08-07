export interface CreateShipmentInput {
  orderNumber: string;
  address: {
    line1: string;
    city: string;
    state: string;
    country: string;
  };
  method: 'standard' | 'express';
}

export interface ShipmentTracking {
  trackingNumber: string;
  status: string;
}

export class ShippingProviderClient {
  async createShipment(_input: CreateShipmentInput): Promise<ShipmentTracking> {
    const { randomUUID } = await import('node:crypto');
    return { trackingNumber: randomUUID().slice(0, 12).toUpperCase(), status: 'processing' };
  }

  async track(trackingNumber: string): Promise<ShipmentTracking | null> {
    return { trackingNumber, status: 'in_transit' };
  }
}
