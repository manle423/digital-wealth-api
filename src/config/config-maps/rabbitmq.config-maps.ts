import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
  exchange: process.env.RABBITMQ_EXCHANGE,
  customerQueue: process.env.CUSTOMER_QUEUE,
  sendWelcomeMailRoutingKey: process.env.SEND_WELCOME_MAIL_ROUTING_KEY,
  sendOtpMailRoutingKey: process.env.SEND_OTP_MAIL_ROUTING_KEY,
  calculateMetricsRoutingKey: process.env.CALCULATE_METRICS_ROUTING_KEY,
}));
