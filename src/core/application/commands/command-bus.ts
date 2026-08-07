import { Command, CommandHandler } from './command.js';

export class CommandBus {
  private readonly handlers = new Map<string, CommandHandler>();

  register(handler: CommandHandler): this {
    this.handlers.set(handler.commandName, handler);
    return this;
  }

  async execute<T extends Command<unknown>>(command: T): Promise<T['__result']> {
    const handler = this.handlers.get(command.constructor.name);
    if (!handler) {
      throw new Error(`No handler registered for command ${command.constructor.name}`);
    }
    return (await handler.handle(command)) as T['__result'];
  }
}
