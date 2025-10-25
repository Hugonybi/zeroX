import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('mint') private readonly queue: Queue) {}

  enqueueMintJob(payload: Record<string, unknown>) {
    return this.queue.add('mint', payload, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 30000
      }
    });
  }
}
