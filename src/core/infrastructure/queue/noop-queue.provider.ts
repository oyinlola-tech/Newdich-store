export interface QueuePort {
  enqueue(jobName: string, payload: Record<string, unknown>): Promise<void>;
}

export class NoopQueueProvider implements QueuePort {
  async enqueue(): Promise<void> {}
}
