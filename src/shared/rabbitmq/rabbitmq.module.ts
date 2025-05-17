import { Global, Module } from '@nestjs/common'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitmqService } from './rabbitmq.service'

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        exchanges: [
          {
            name: configService.get<string>('rabbitmq.exchange'),
            type: 'topic',
          },
        ],
        uri: configService.get<string>('rabbitmq.url'),
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [RabbitmqService],
  exports: [RabbitMQModule, RabbitmqService],
})
export class RabbitmqModule { }
