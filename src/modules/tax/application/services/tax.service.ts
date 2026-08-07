import type { TaxRuleRepositoryPort } from '../../infrastructure/repositories/prisma-tax-rule.repository.js';

export class TaxService {
  constructor(private readonly taxRuleRepository: TaxRuleRepositoryPort) {}

  getDefault() {
    return this.taxRuleRepository.getDefault();
  }

  async getRate(country = 'NG', state?: string): Promise<number> {
    const rule =
      (await this.taxRuleRepository.findByCountryState(country, state)) ??
      (await this.taxRuleRepository.getDefault());
    return rule ? Number(rule.rate) / 100 : 0;
  }

  list() {
    return this.taxRuleRepository.list();
  }

  create(input: { country: string; state?: string; rate: number; isDefault?: boolean }) {
    return this.taxRuleRepository.create(input);
  }

  update(id: string, input: { country?: string; state?: string | null; rate?: number; isDefault?: boolean }) {
    return this.taxRuleRepository.update(id, input);
  }

  remove(id: string) {
    return this.taxRuleRepository.remove(id);
  }
}
