import { Command } from '../../../../../core/application/commands/command.js';
import type { ProductService } from '../../services/product.service.js';

export class ArchiveProductCommand extends Command<Awaited<ReturnType<ProductService['archive']>>> {
  constructor(readonly productId: string) {
    super();
  }
}
