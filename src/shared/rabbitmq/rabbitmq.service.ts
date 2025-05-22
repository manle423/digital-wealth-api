import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class RabbitmqService {
  public exchange: string
  constructor(
    private readonly configService: ConfigService,
    private readonly amqpConnection: AmqpConnection,
    private readonly logger: LoggerService,
  ) {
    this.exchange = this.configService.get('rabbitmq.exchange')
  }

  async push(key: string, data: any) {
    this.logger.debug(`Pushing message to queue with key: ${key}`, { key, exchange: this.exchange });
    data.dateTime = new Date()
    await this.amqpConnection.publish(this.exchange, key, JSON.stringify(data))
  }
}
