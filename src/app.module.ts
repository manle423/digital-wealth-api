import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './shared/logger/logger.module';
import AppConfig from './config/config-maps/app.config-maps';
import { AppConfigModule } from './config/config.module';
import { MysqlDbModule } from './shared/mysqldb/mysqldb.module';
import { RiskAssessmentModule } from './modules/risk-assessment/risk-assessment.module';
import { RabbitmqModule } from './shared/rabbitmq/rabbitmq.module';
import { RedisModule } from './shared/redis/redis.module';
import { PortfolioManagementModule } from './modules/portfolio-management/portfolio-management.module';
import { TaskQueueModule } from './modules/task-queue/task-queue.module';
import { GmailModule } from './shared/email/gmail.module';
import { SessionValidationMiddleware } from './modules/auth/middleware/session-validation.middleware';
import { AssetManagementModule } from './modules/asset-management/asset-management.module';
import { DebtManagementModule } from './modules/debt-management/debt-management.module';
import { NetWorthModule } from './modules/net-worth/net-worth.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { FinancialAnalysisModule } from './modules/financial-analysis/financial-analysis.module';
import { GeminiModule } from './shared/gemini/gemini.module';
import { ResendModule } from './shared/email/resend.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
    }),
    AppConfigModule.load(),
    LoggerModule,
    GeminiModule,
    UserModule,
    AuthModule,
    MysqlDbModule,
    RiskAssessmentModule,
    RabbitmqModule,
    RedisModule,
    PortfolioManagementModule,
    TaskQueueModule,
    GmailModule,
    ResendModule,
    AssetManagementModule,
    DebtManagementModule,
    RecommendationModule,
    FinancialAnalysisModule,
    NetWorthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionValidationMiddleware)
      .exclude(
        'auth/login',
        'auth/register',
        'auth/refresh',
        'auth/forgot-password',
        'auth/reset-password',
      )
      .forRoutes('*');
  }
}
