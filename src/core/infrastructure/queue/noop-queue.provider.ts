import type { QueuePort } from '../../application/ports/queue.port.js';

export class NoopQueueProvider implements QueuePort {
  async enqueue(): Promise<void> {}
}
