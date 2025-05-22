import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { LoggerService } from '@/shared/logger/logger.service';
import { IWelcomeEmailData } from '../interfaces/notification.interface';
import { renderTemplate } from '@/modules/task-queue/utils/render-template';
import { GmailService } from '@/shared/email/gmail.service';

@Injectable()
export class NotificationConsumer {
  constructor(
    private readonly logger: LoggerService,
    private readonly gmailService: GmailService,
  ) {}

  @RabbitRPC({
    name: 'sendWelcomeMail'
  })
  async handleWelcomeEmail(rawMessage: string) {
    try {
      this.logger.info('Processing welcome email message', { rawMessage });
      
      // Parse JSON string to object
      let message: IWelcomeEmailData;
      try {
        message = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
      } catch (parseError) {
        this.logger.error('Failed to parse message', { error: parseError, rawMessage });
        throw new Error('Invalid message format');
      }

      // Validate message structure
      if (!message || !message.data || !message.data.name || !message.data.email) {
        this.logger.error('Invalid message structure', { message });
        throw new Error('Invalid message structure');
      }

      // Render email template
      const emailContent = renderTemplate('welcome', {
        name: message.data.name,
        email: message.data.email
      }, ['email']); // Specify the folder containing the template

      this.logger.info('Welcome email would be sent with content:', { emailContent });
      
      // Gửi email sử dụng GmailService
      await this.gmailService.sendEmail(
        message.data.email,
        'Welcome to Digital Wealth',
        emailContent
      );
      
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to process welcome email message', { error, rawMessage });
      throw error;
    }
  }
}