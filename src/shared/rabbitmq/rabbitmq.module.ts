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
            options: {
              durable: true
            }
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
              autoDelete: false
            },
          },
          sendOtpMail: {
            exchange: configService.get<string>('rabbitmq.exchange'),
            routingKey: configService.get<string>('rabbitmq.sendOtpMailRoutingKey'),
            queue: configService.get<string>('rabbitmq.customerQueue'),
            errorHandler: defaultNackErrorHandler,
            queueOptions: {
              durable: true,
              autoDelete: false
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
        connectionInitOptions: { 
          wait: true,
          timeout: 20000,
          reject: true
        },
        channels: {
          'default-channel': {
            prefetchCount: 10,
            default: true,
          },
        },
        reconnectTimeInSeconds: 5,
        heartbeatIntervalInSeconds: 5,
        connectionManagerOptions: {
          heartbeatIntervalInSeconds: 5,
          reconnectTimeInSeconds: 5,
        },
      }),
    }),
  ],
  providers: [RabbitmqService],
  exports: [RabbitMQModule, RabbitmqService],
})
export class RabbitmqModule { }
