import { Injectable } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/shared/logger/logger.service';

@Injectable()
export class SendGridService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    sendgrid.setApiKey(this.configService.get('email.sendgrid.apiKey'));
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const msg = {
        to,
        subject,
        html,
        from: this.configService.get('email.sendgrid.from'),
      };

      const result = await sendgrid.send(msg);

      this.logger.info('Email sent successfully via SendGrid', {
        statusCode: result[0].statusCode,
        to,
        subject,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to send email via SendGrid', {
        error,
        to,
        subject,
      });
      throw error;
    }
  }
}