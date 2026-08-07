import { Command } from '../../../../../core/application/commands/command.js';

export class DeleteAccountCommand extends Command<void> {
  constructor(readonly userId: string) {
    super();
  }
}
