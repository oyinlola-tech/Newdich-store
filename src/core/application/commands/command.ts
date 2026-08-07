export abstract class Command<R = unknown> {
  declare readonly __result: R;
}

export interface CommandHandler<T extends Command = Command, R = unknown> {
  readonly commandName: string;
  handle(command: T): Promise<R> | R;
}
