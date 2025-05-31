import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FinancialAnalysisService } from './financial-analysis.service';
import { LoggerService } from '@/shared/logger/logger.service';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { RabbitmqService } from '@/shared/rabbitmq/rabbitmq.service';
import { RoutingKey } from '@/shared/rabbitmq/constants';

@Injectable()
export class FinancialAnalysisJobService {
  constructor(
    private readonly financialAnalysisService: FinancialAnalysisService,
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  /**
   * Calculate financial metrics for all active users daily at 1 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async calculateDailyMetrics(): Promise<void> {
    try {
      this.logger.info(
        '[calculateDailyMetrics] Starting daily metric calculations',
      );

      const activeUsers = await this.userRepository.findActiveUsers();
      this.logger.info(
        `[calculateDailyMetrics] Found ${activeUsers.length} active users`,
      );

      let queuedCount = 0;

      for (const user of activeUsers) {
        try {
          await this.rabbitmqService.push(RoutingKey.calculateMetrics, {
            userId: user.id,
          });
          queuedCount++;
          this.logger.debug(
            `[calculateDailyMetrics] Queued metrics calculation for user ${user.id}`,
          );
        } catch (error) {
          this.logger.error(
            `[calculateDailyMetrics] Error queueing metrics calculation for user ${user.id}`,
            error,
          );
        }
      }

      this.logger.info(
        `[calculateDailyMetrics] Queued metrics calculation for ${queuedCount} users`,
      );
    } catch (error) {
      this.logger.error(
        '[calculateDailyMetrics] Error in daily metric calculations',
        error,
      );
    }
  }

  /**
   * Clean up old metrics weekly on Sunday at 3 AM
   * 0 at minute, 3 at hour, * every day of month, * every month, 0 on Sunday
   */
  @Cron('0 3 * * 0')
  async cleanupOldMetrics(): Promise<void> {
    try {
      this.logger.info('[cleanupOldMetrics] Starting weekly metric cleanup');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep last 90 days

      // TODO: Implement cleanup logic in repository
      // await this.financialMetricRepository.deleteOldMetrics(cutoffDate);

      this.logger.info('[cleanupOldMetrics] Completed weekly metric cleanup');
    } catch (error) {
      this.logger.error('[cleanupOldMetrics] Error in metric cleanup', error);
    }
  }

  /**
   * Manual method to calculate metrics for a specific user
   */
  async calculateMetricsForUser(userId: string): Promise<void> {
    try {
      this.logger.info(
        `[calculateMetricsForUser] Queueing metrics calculation for user ${userId}`,
      );
      await this.rabbitmqService.push(RoutingKey.calculateMetrics, {
        userId,
      });
      this.logger.info(
        `[calculateMetricsForUser] Successfully queued metrics calculation for user ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `[calculateMetricsForUser] Error queueing metrics calculation for user ${userId}`,
        error,
      );
      throw error;
    }
  }
}
