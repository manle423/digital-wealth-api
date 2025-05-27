import { Module } from '@nestjs/common';
import { NotificationConsumer } from './consumers/notification.consumer';
import { RabbitmqModule } from '@/shared/rabbitmq/rabbitmq.module';
import { MetricsConsumer } from './consumers/metrics.consumer';
import { FinancialAnalysisModule } from '../financial-analysis/financial-analysis.module';

@Module({
  imports: [
    RabbitmqModule,
    FinancialAnalysisModule
  ],
  providers: [
    NotificationConsumer,
    MetricsConsumer,
  ],
  exports: [
    NotificationConsumer,
    MetricsConsumer,
  ],
})
export class TaskQueueModule {}