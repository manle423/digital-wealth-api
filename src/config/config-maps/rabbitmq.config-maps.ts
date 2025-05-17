import {registerAs} from '@nestjs/config'

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
  exchange: process.env.RABBITMQ_EXCHANGE,
}))
