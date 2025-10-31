import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';

@Injectable()
export class QueueInitializationService implements OnModuleInit {
  private readonly logger = new Logger(QueueInitializationService.name);

  constructor(private readonly queueService: QueueService) {}

  async onModuleInit() {
    try {
      // Schedule the cart cleanup job to run every hour
      await this.queueService.scheduleCartCleanup();
      this.logger.log('✅ Cart cleanup job scheduled successfully (runs every hour)');
    } catch (error) {
      this.logger.error('❌ Failed to schedule cart cleanup job:', error);
      // Don't throw - let the application continue without the cleanup job
    }
  }
}