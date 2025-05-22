import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { LoggerService } from '@/shared/logger/logger.service';
import { IWelcomeEmailData } from '../interfaces/notification.interface';

@Injectable()
export class NotificationConsumer {
  constructor(
    private readonly logger: LoggerService,
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

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate email content
      const emailContent = `
        Dear ${message.data.name},

        Welcome to Digital Wealth! We're excited to have you on board.

        Your account has been successfully created with the email: ${message.data.email}

        Best regards,
        Digital Wealth Team
      `;

      this.logger.info('Welcome email would be sent with content:', { emailContent });
      
      return { success: true, message: 'Welcome email processed successfully' };
    } catch (error) {
      this.logger.error('Failed to process welcome email message', { error, rawMessage });
      throw error;
    }
  }
}