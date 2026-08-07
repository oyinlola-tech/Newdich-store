import { Command } from '../../../../../core/application/commands/command.js';
import type { CategoryService } from '../../services/category.service.js';
import type { UpdateCategoryDto } from '../../../presentation/dto/category.dto.js';

export class UpdateCategoryCommand extends Command<Awaited<ReturnType<CategoryService['update']>>> {
  constructor(readonly categoryId: string, readonly dto: UpdateCategoryDto) {
    super();
  }
}
