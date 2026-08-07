import { Command } from '../../../../../core/application/commands/command.js';
import type { CategoryService } from '../../services/category.service.js';

export class ReorderCategoryCommand extends Command<Awaited<ReturnType<CategoryService['update']>>> {
  constructor(readonly categoryId: string, readonly sortOrder: number) {
    super();
  }
}
