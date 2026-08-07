import { Command } from '../../../../../core/application/commands/command.js';

export class DeleteProductCommand extends Command<void> {
  constructor(readonly productId: string) {
    super();
  }
}
