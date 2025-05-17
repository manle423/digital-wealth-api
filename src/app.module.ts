import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
    }),
    AppConfigModule.load(),
    UserModule,
    AuthModule,
    LoggerModule,
    MysqlDbModule,
    RiskAssessmentModule,
    RabbitmqModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
