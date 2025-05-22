import { config } from 'dotenv'
config()
export const RoutingKey = {
  sendWelcomeMail: process.env.SEND_WELCOME_MAIL_ROUTING_KEY,
}
