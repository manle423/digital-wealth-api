import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { LoggerService } from '@/shared/logger/logger.service';
import {
  IWelcomeEmailData,
  IOtpEmailData,
} from '../interfaces/notification.interface';
import { renderTemplate } from '@/modules/task-queue/utils/render-template';
import { GmailService } from '@/shared/email/gmail.service';
import { ResendService } from '@/shared/email/resend.service';
import { ConfigService } from '@nestjs/config';
import { SendGridService } from '@/shared/email/sendgrid.service';

@Injectable()
export class NotificationConsumer {
  constructor(
    private readonly logger: LoggerService,
    private readonly resendService: ResendService,
    private readonly gmailService: GmailService,
    private readonly configService: ConfigService,
    private readonly sendGridService: SendGridService,
  ) { }

  private async sendEmailWithFallback(to: string, subject: string, html: string) {
    try {
      // Thử gửi bằng Resend trước
      await this.resendService.sendEmail(to, subject, html);
      return;
    } catch (resendError) {
      this.logger.warn('Failed to send email via Resend, falling back to Gmail', {
        error: resendError,
        to,
        subject,
      });

      try {
        // Nếu Resend thất bại, thử gửi bằng Gmail
        await this.gmailService.sendEmail(to, subject, html);
      } catch (gmailError) {
        this.logger.error('Failed to send email via both Resend and Gmail', {
          resendError,
          gmailError,
          to,
          subject,
        });
        throw gmailError;
      }
    }
  }

  @RabbitRPC({
    exchange: 'common-exchange-staging',
    routingKey: 'send-welcome-mail-staging',
    queue: 'customer-queue-staging',
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

      // Gửi email với cơ chế fallback
      await this.sendEmailWithFallback(
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
    exchange: 'common-exchange-staging',
    routingKey: 'send-otp-mail-staging',
    queue: 'customer-queue-staging',
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

      // Gửi email với cơ chế fallback
      await this.sendEmailWithFallback(
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
