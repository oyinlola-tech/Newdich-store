export interface QueuePort {
  enqueue(jobName: string, payload: Record<string, unknown>): Promise<void>;
}
