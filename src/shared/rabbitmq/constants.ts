import {config} from 'dotenv'
config()
export const RoutingKey = {
  sendOtp: process.env.SEND_OTP_ROUTING_KEY,
  sendEmail: process.env.SEND_EMAIL_ROUTING_KEY,
  sendPassword: process.env.SEND_PASSWORD_ROUTING_KEY,
  syncEGCVouchersToUser: process.env.SYNC_EGC_VOUCHERS_TO_USER_ROUTING_KEY,
}
