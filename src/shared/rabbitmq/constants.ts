import { config } from 'dotenv'
config()
export const RoutingKey = {
  sendWelcomeMail: process.env.SEND_WELCOME_MAIL_ROUTING_KEY,
  sendOtpMail: process.env.SEND_OTP_MAIL_ROUTING_KEY,
  calculateMetrics: process.env.CALCULATE_METRICS_ROUTING_KEY,
}
