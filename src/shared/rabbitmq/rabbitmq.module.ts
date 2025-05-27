import { Global, Module } from '@nestjs/common'
import { defaultNackErrorHandler, RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitmqService } from './rabbitmq.service'

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('rabbitmq.url'),
        exchanges: [
          {
            name: configService.get<string>('rabbitmq.exchange'),
            type: 'topic',
          },
        ],
        handlers: {
          sendWelcomeMail: {
            exchange: configService.get<string>('rabbitmq.exchange'),
            routingKey: configService.get<string>('rabbitmq.sendWelcomeMailRoutingKey'),
            queue: configService.get<string>('rabbitmq.customerQueue'),
            errorHandler: defaultNackErrorHandler,
            queueOptions: {
              durable: true,
            },
          },
          sendOtpMail: {
            exchange: configService.get<string>('rabbitmq.exchange'),
            routingKey: configService.get<string>('rabbitmq.sendOtpMailRoutingKey'),
            queue: configService.get<string>('rabbitmq.customerQueue'),
            errorHandler: defaultNackErrorHandler,
            queueOptions: {
              durable: true,
            },
          },
          calculateMetrics: {
            exchange: configService.get<string>('rabbitmq.exchange'),
            routingKey: configService.get<string>('rabbitmq.calculateMetricsRoutingKey'),
            queue: configService.get<string>('rabbitmq.customerQueue'),
            errorHandler: defaultNackErrorHandler,
            queueOptions: {
              durable: true,
            },
          },
        },
        connectionInitOptions: {wait: false},
        channels: {
          'default-channel': {
            prefetchCount: 10,
            default: true,
          },
        },
      }),
    }),
  ],
  providers: [RabbitmqService],
  exports: [RabbitMQModule, RabbitmqService],
})
export class RabbitmqModule { }
