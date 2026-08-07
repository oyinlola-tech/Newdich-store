import { Command } from '../../../../../core/application/commands/command.js';
import type { ProductService } from '../../services/product.service.js';

export class PublishProductCommand extends Command<Awaited<ReturnType<ProductService['publish']>>> {
  constructor(readonly productId: string) {
    super();
  }
}
