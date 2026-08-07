import { Command } from '../../../../../core/application/commands/command.js';
import type { ProductService } from '../../services/product.service.js';
import type { CreateProductInput } from '../../services/product.service.js';

export class CreateProductCommand extends Command<Awaited<ReturnType<ProductService['create']>>> {
  constructor(readonly input: CreateProductInput) {
    super();
  }
}
