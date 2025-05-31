import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { LoggerService } from '@/shared/logger/logger.service';
import {
  IWelcomeEmailData,
  IOtpEmailData,
} from '../interfaces/notification.interface';
import { renderTemplate } from '@/modules/task-queue/utils/render-template';
import { GmailService } from '@/shared/email/gmail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationConsumer {
  constructor(
    private readonly logger: LoggerService,
    private readonly gmailService: GmailService,
    private readonly configService: ConfigService,
  ) {}

  @RabbitRPC({
    name: 'sendWelcomeMail',
  })
  async handleWelcomeEmail(rawMessage: string) {
    try {
      this.logger.info('Processing welcome email message', { rawMessage });

      // Parse JSON string to object
      let message: IWelcomeEmailData;
      try {
        message =
          typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
      } catch (parseError) {
        this.logger.error('Failed to parse message', {
          error: parseError,
          rawMessage,
        });
        throw new Error('Invalid message format');
      }

      // Validate message structure
      if (
        !message ||
        !message.data ||
        !message.data.name ||
        !message.data.email
      ) {
        this.logger.error('Invalid message structure', { message });
        throw new Error('Invalid message structure');
      }

      // Render email template
      const emailContent = renderTemplate(
        'welcome',
        {
          name: message.data.name,
          email: message.data.email,
        },
        ['email'],
      );

      // Gửi email sử dụng GmailService
      await this.gmailService.sendEmail(
        message.data.email,
        'Welcome to Digital Wealth',
        emailContent,
      );

      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to process welcome email message', {
        error,
        rawMessage,
      });
      throw error;
    }
  }

  @RabbitRPC({
    name: 'sendOtpMail',
  })
  async handleOtpEmail(rawMessage: string) {
    try {
      this.logger.info('Processing OTP email message', { rawMessage });

      // Parse JSON string to object
      let message: IOtpEmailData;
      try {
        message =
          typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
      } catch (parseError) {
        this.logger.error('Failed to parse message', {
          error: parseError,
          rawMessage,
        });
        throw new Error('Invalid message format');
      }

      // Validate message structure
      if (
        !message ||
        !message.data ||
        !message.data.otp ||
        !message.data.email
      ) {
        this.logger.error('Invalid message structure', { message });
        throw new Error('Invalid message structure');
      }

      // Render email template
      const emailContent = renderTemplate(
        message.template,
        {
          otp: message.data.otp,
          expiryMinutes: message.data.expiryMinutes,
          email: message.data.email,
        },
        ['email'],
      );

      await this.gmailService.sendEmail(
        message.data.email,
        message.subject,
        emailContent,
      );

      return { success: true, message: 'OTP email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to process OTP email message', {
        error,
        rawMessage,
      });
      throw error;
    }
  }
}
