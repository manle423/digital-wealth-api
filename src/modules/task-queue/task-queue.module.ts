import { Module } from '@nestjs/common';
import { NotificationConsumer } from './consumers/notification.consumer';
import { RabbitmqModule } from '@/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitmqModule,
  ],
  providers: [
    NotificationConsumer,
  ],
  exports: [
    NotificationConsumer,
  ],
})
export class TaskQueueModule {}