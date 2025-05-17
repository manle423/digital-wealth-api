import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RabbitmqService {
  public exchange: string
  constructor(
    private readonly configService: ConfigService,
    private readonly amqpConnection: AmqpConnection,
  ) {
    this.exchange = this.configService.get('rabbitmq.exchange')
  }

  async push(key: string, data: any) {
    data.dateTime = new Date()
    await this.amqpConnection.publish(this.exchange, key, JSON.stringify(data))
  }
}
