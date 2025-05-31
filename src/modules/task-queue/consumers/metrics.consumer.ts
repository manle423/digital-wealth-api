import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { LoggerService } from '@/shared/logger/logger.service';
import { FinancialAnalysisService } from '@/modules/financial-analysis/services/financial-analysis.service';

interface ICalculateMetricsData {
  userId: string;
}

@Injectable()
export class MetricsConsumer {
  constructor(
    private readonly logger: LoggerService,
    private readonly financialAnalysisService: FinancialAnalysisService,
  ) {}

  @RabbitRPC({
    name: 'calculateMetrics',
  })
  async handleCalculateMetrics(rawMessage: string) {
    try {
      this.logger.info(
        '[handleCalculateMetrics] Processing metrics calculation message',
        { rawMessage },
      );

      // Parse JSON string to object
      let message: ICalculateMetricsData;
      try {
        message =
          typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
      } catch (parseError) {
        this.logger.error('[handleCalculateMetrics] Failed to parse message', {
          error: parseError,
          rawMessage,
        });
        throw new Error('Invalid message format');
      }

      // Validate message structure
      if (!message || !message.userId) {
        this.logger.error(
          '[handleCalculateMetrics] Invalid message structure',
          { message },
        );
        throw new Error('Invalid message structure');
      }

      // Calculate metrics
      await this.financialAnalysisService.calculateAllMetrics(message.userId);

      return { success: true, message: 'Metrics calculated successfully' };
    } catch (error) {
      this.logger.error(
        '[handleCalculateMetrics] Failed to process metrics calculation',
        { error, rawMessage },
      );
      throw error;
    }
  }
}
