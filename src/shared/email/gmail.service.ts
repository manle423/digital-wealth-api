import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/shared/logger/logger.service'

@Injectable()
export class GmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject,
        html,
      })

      this.logger.info('Email sent successfully', { 
        messageId: result.messageId,
        to,
        subject 
      })

      return result
    } catch (error) {
      this.logger.error('Failed to send email', { 
        error,
        to,
        subject 
      })
      throw error
    }
  }
}
