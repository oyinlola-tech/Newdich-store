import { Command } from '../../../../../core/application/commands/command.js';

export class DeleteCategoryCommand extends Command<void> {
  constructor(readonly categoryId: string) {
    super();
  }
}
