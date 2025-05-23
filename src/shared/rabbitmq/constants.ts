import { config } from 'dotenv'
config()
export const RoutingKey = {
  sendWelcomeMail: process.env.SEND_WELCOME_MAIL_ROUTING_KEY,
  sendOtpMail: process.env.SEND_OTP_MAIL_ROUTING_KEY,
}
