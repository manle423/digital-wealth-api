import { Global, Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { GmailService } from './gmail.service'
import { ConfigService } from '@nestjs/config'
import { LoggerModule } from '@/shared/logger/logger.module'

@Global()
@Module({
  imports: [
    LoggerModule,
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('gmail.host'),
          port: configService.get('gmail.port'),
          secure: configService.get('gmail.secure'),
          auth: {
            user: configService.get('gmail.auth.user'),
            pass: configService.get('gmail.auth.pass'),
          },
        },
        defaults: {
          from: configService.get('gmail.auth.from'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GmailService],
  exports: [GmailService],
})
export class GmailModule { }
