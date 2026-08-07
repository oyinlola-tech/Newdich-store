import { Command } from '../../../../../core/application/commands/command.js';
import type { ProductService } from '../../services/product.service.js';
import type { UpdateProductInput } from '../../services/product.service.js';

export class UpdateProductCommand extends Command<Awaited<ReturnType<ProductService['update']>>> {
  constructor(readonly productId: string, readonly input: UpdateProductInput) {
    super();
  }
}
