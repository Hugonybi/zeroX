import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MintQueueName, CartCleanupQueueName } from './queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(MintQueueName) private readonly mintQueue: Queue,
    @InjectQueue(CartCleanupQueueName) private readonly cartCleanupQueue: Queue
  ) {}

  enqueueMintJob(payload: Record<string, unknown>) {
    return this.mintQueue.add('mint', payload, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 30000
      }
    });
  }

  /**
   * Schedule cart cleanup job to run every hour
   * Requirement 3.5: Remove expired items after 24 hours
   */
  async scheduleCartCleanup() {
    // Add repeatable job that runs every hour
    return this.cartCleanupQueue.add(
      'cleanup_expired_carts',
      {},
      {
        repeat: { cron: '0 * * * *' }, // Every hour at minute 0
        removeOnComplete: 10, // Keep last 10 completed jobs
        removeOnFail: 5, // Keep last 5 failed jobs
      }
    );
  }

  /**
   * Manually trigger cart cleanup (for testing or admin use)
   */
  async triggerCartCleanup() {
    return this.cartCleanupQueue.add('cleanup_expired_carts', {});
  }
}
