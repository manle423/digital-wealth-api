import { Module } from '@nestjs/common';
import { NotificationConsumer } from './consumers/notification.consumer';

@Module({
  imports: [],
  providers: [
    NotificationConsumer,
  ],
  exports: [
    NotificationConsumer,
  ],
})
export class TaskQueueModule {}