import {registerAs} from '@nestjs/config'

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
  exchange: process.env.RABBITMQ_EXCHANGE,
  customerQueue: process.env.CUSTOMER_QUEUE,
  sendWelcomeMailRoutingKey: process.env.SEND_WELCOME_MAIL_ROUTING_KEY,
}))

// RABBITMQ_EXCHANGE=common-exchange-staging 
// RABBITMQ_URL=amqp://admin:admin@localhost:5673/ 

// CUSTOMER_QUEUE=customer-queue-staging
// SEND_WELCOME_MAIL_ROUTING_KEY=send-welcome-mail-staging