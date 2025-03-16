import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.AUTH_SECRET,
  expiresIn: Number(process.env.AUTH_EXPIRES_IN),
  saltRound: Number(process.env.SALT_ROUND) || 10,
}));
