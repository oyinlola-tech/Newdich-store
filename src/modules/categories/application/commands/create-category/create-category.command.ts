import { Command } from '../../../../../core/application/commands/command.js';
import type { CategoryService } from '../../services/category.service.js';
import type { CreateCategoryDto } from '../../../presentation/dto/category.dto.js';

export class CreateCategoryCommand extends Command<Awaited<ReturnType<CategoryService['create']>>> {
  constructor(readonly dto: CreateCategoryDto) {
    super();
  }
}
