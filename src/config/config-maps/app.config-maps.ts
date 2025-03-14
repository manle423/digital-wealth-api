import {registerAs} from '@nestjs/config'

export default registerAs('app', () => ({
  host: process.env.HOST || 'localhost',
  port: parseInt(process.env.PORT, 10) || 8080,
  socket_url: process.env.SOCKET_URL
}))
