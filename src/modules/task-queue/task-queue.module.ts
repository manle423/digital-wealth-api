import { Module } from '@nestjs/common';
import { NotificationConsumer } from './consumers/notification.consumer';
import { RabbitmqModule } from '@/shared/rabbitmq/rabbitmq.module';
import { MetricsConsumer } from './consumers/metrics.consumer';
import { FinancialAnalysisModule } from '../financial-analysis/financial-analysis.module';
import { SendGridModule } from '@/shared/email/sendgrid.module';
import { ResendModule } from '@/shared/email/resend.module';
import { GmailModule } from '@/shared/email/gmail.module';

@Module({
  imports: [RabbitmqModule, FinancialAnalysisModule, SendGridModule, ResendModule, GmailModule],
  providers: [NotificationConsumer, MetricsConsumer],
  exports: [NotificationConsumer, MetricsConsumer],
})
export class TaskQueueModule {}
