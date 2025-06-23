import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  gmail: {
    host: process.env.GMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.GMAIL_PORT, 10) || 587,
    secure: process.env.GMAIL_SECURE === 'true',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
      from: process.env.GMAIL_FROM || 'Digital Wealth <no-reply@gmail.com>',
    },
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL || 'Digital Wealth <no-reply@digitalwealth.duckdns.org>',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.SENDGRID_FROM_EMAIL || 'Digital Wealth <no-reply@digitalwealth.duckdns.org>',
  }
}));
