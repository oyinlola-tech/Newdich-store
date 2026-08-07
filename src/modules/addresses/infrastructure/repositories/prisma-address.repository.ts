import type { PrismaClient } from '@prisma/client';
import type { Address } from '@prisma/client';

export interface CreateAddressInput {
  label?: string;
  firstName: string;
  lastName?: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  label?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface AddressRepositoryPort {
  findById(id: string): Promise<Address | null>;
  findByUserId(userId: string): Promise<Address[]>;
  create(userId: string, input: CreateAddressInput): Promise<Address>;
  update(id: string, input: UpdateAddressInput): Promise<Address>;
  delete(id: string): Promise<void>;
  clearDefault(userId: string): Promise<void>;
}

export class PrismaAddressRepository implements AddressRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string): Promise<Address | null> {
    return this.prisma.address.findUnique({ where: { id } });
  }

  findByUserId(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  }

  async create(userId: string, input: CreateAddressInput): Promise<Address> {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.address.count({ where: { userId } });
      const isDefault = input.isDefault ?? count === 0;
      if (isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.address.create({
        data: { userId, ...input, isDefault }
      });
    });
  }

  async update(id: string, input: UpdateAddressInput): Promise<Address> {
    return this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        const address = await tx.address.findUnique({ where: { id } });
        if (address) {
          await tx.address.updateMany({ where: { userId: address.userId }, data: { isDefault: false } });
        }
      }
      return tx.address.update({ where: { id }, data: input });
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({ where: { id } });
  }

  clearDefault(userId: string): Promise<void> {
    return this.prisma.address
      .updateMany({ where: { userId }, data: { isDefault: false } })
      .then(() => undefined);
  }
}
