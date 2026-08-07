import type { AddressRepositoryPort } from '../../infrastructure/repositories/prisma-address.repository.js';

export class AddressService {
  constructor(private readonly addressRepository: AddressRepositoryPort) {}

  listByUser(userId: string) {
    return this.addressRepository.findByUserId(userId);
  }

  getById(id: string) {
    return this.addressRepository.findById(id);
  }

  create(userId: string, input: Parameters<AddressRepositoryPort['create']>[1]) {
    return this.addressRepository.create(userId, input);
  }

  update(id: string, input: Parameters<AddressRepositoryPort['update']>[1]) {
    return this.addressRepository.update(id, input);
  }

  async remove(userId: string, id: string): Promise<void> {
    const address = await this.addressRepository.findById(id);
    if (!address || address.userId !== userId) {
      throw new Error('Address not found.');
    }
    await this.addressRepository.delete(id);
  }
}
