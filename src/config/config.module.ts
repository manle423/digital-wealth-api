import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import AppConfig from './config-maps/app.config-maps';
import LoggerConfig from './config-maps/logger.config-maps';
import RedisConfig from './config-maps/redis.config-maps';
import AuthConfig from './config-maps/auth.config-map';
import MysqlDbConfig from './config-maps/mysqldb.config-maps';
import RabbitMQConfig from './config-maps/rabbitmq.config-maps';
import EmailConfig from './config-maps/email.config-map';

@Global()
@Module({})
export class AppConfigModule {
  static load(): DynamicModule {
    const envFilePath = [`.env.${process.env.NODE_ENV}`, '.env'];

    return {
      module: AppConfigModule,
      imports: [
        NestConfigModule.forRoot({
          load: [
            AppConfig,
            LoggerConfig,
            RedisConfig,
            AuthConfig,
            MysqlDbConfig,
            RabbitMQConfig,
            EmailConfig,
          ],
          envFilePath,
        }),
      ],
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
