import type { PrismaClient } from '@prisma/client';
import type { TaxRule } from '@prisma/client';

export interface TaxRuleRepositoryPort {
  getDefault(): Promise<TaxRule | null>;
  list(): Promise<TaxRule[]>;
  findById(id: string): Promise<TaxRule | null>;
  findByCountryState(country: string, state?: string): Promise<TaxRule | null>;
  create(input: { country: string; state?: string; rate: number; isDefault?: boolean }): Promise<TaxRule>;
  update(id: string, input: { country?: string; state?: string | null; rate?: number; isDefault?: boolean }): Promise<TaxRule>;
  remove(id: string): Promise<void>;
}

export class PrismaTaxRuleRepository implements TaxRuleRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  getDefault(): Promise<TaxRule | null> {
    return this.prisma.taxRule.findFirst({ where: { isDefault: true } });
  }

  list(): Promise<TaxRule[]> {
    return this.prisma.taxRule.findMany({ orderBy: { country: 'asc' } });
  }

  findById(id: string): Promise<TaxRule | null> {
    return this.prisma.taxRule.findUnique({ where: { id } });
  }

  findByCountryState(country: string, state?: string): Promise<TaxRule | null> {
    return this.prisma.taxRule.findFirst({
      where: state ? { country, state } : { country, state: null }
    });
  }

  async create(input: { country: string; state?: string; rate: number; isDefault?: boolean }): Promise<TaxRule> {
    if (input.isDefault) {
      await this.prisma.taxRule.updateMany({ data: { isDefault: false } });
    }
    return this.prisma.taxRule.create({
      data: {
        country: input.country,
        state: input.state ?? null,
        rate: input.rate,
        isDefault: input.isDefault ?? false
      }
    });
  }

  async update(id: string, input: { country?: string; state?: string | null; rate?: number; isDefault?: boolean }): Promise<TaxRule> {
    if (input.isDefault) {
      await this.prisma.taxRule.updateMany({ data: { isDefault: false } });
    }
    return this.prisma.taxRule.update({ where: { id }, data: input });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.taxRule.delete({ where: { id } });
  }
}
