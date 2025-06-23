import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/shared/logger/logger.service';

@Injectable()
export class ResendService {
  private resend: Resend;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.resend = new Resend(this.configService.get('email.resend.apiKey'));
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const result = await this.resend.emails.send({
        from: this.configService.get('email.resend.from'),
        to,
        subject,
        html,
      });

      this.logger.info('Email sent successfully', {
        id: result.data?.id,
        to,
        subject,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to send email', {
        error,
        to,
        subject,
      });
      throw error;
    }
  }
}
