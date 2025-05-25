import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserOtp } from '@/modules/user/entities/user-otp.entity';
import { OtpType } from '@/modules/user/enums/otp-type.enum';
import { OtpStatus } from '@/modules/user/enums/otp-status.enum';
import { LoggerService } from '@/shared/logger/logger.service';
import { Request } from 'express';
import { AuthError } from '../enum/error.enum';
import { RabbitmqService } from '@/shared/rabbitmq/rabbitmq.service';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { IOtpEmailData } from '@/modules/task-queue/interfaces/notification.interface';
import { RoutingKey } from '@/shared/rabbitmq/constants';
import { UserOtpRepository } from '@/modules/user/repositories/user-otp.repository';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 15;
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_WAIT_MINUTES = 15;

  constructor(
    private readonly userOtpRepository: UserOtpRepository,
    private readonly logger: LoggerService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly redisService: RedisService,
  ) {}

  async generateOtp(
    email: string,
    type: OtpType,
    userId?: string,
    req?: Request,
  ): Promise<void> {
    this.logger.info('[generateOtp]', { email, type });

    // Kiểm tra cache cho số lần retry
    const retryCacheKey = `${RedisKeyPrefix.OTP_RETRY}:${email}:${type}`;
    const retryData = await this.redisService.get(retryCacheKey);
    
    if (retryData) {
      const { count, lastRetryAt } = JSON.parse(retryData);
      if (count >= this.MAX_RETRY_COUNT) {
        const waitUntil = new Date(lastRetryAt).getTime() + this.RETRY_WAIT_MINUTES * 60000;
        if (waitUntil > Date.now()) {
          throw new UnauthorizedException(AuthError.TOO_MANY_ATTEMPTS);
        }
      }
    }

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

    const userOtp = await this.userOtpRepository.create({
      userId,
      email,
      otp,
      type,
      status: OtpStatus.PENDING,
      expiresAt,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
      retryCount: retryData ? JSON.parse(retryData).count + 1 : 0,
      lastRetryAt: new Date(),
    });

    await this.userOtpRepository.save(userOtp);

    // Cập nhật cache retry
    await this.redisService.set(
      retryCacheKey,
      JSON.stringify({
        count: userOtp.retryCount,
        lastRetryAt: userOtp.lastRetryAt.toISOString(),
      }),
      RedisKeyTtl.FIFTEEN_MINUTES
    );

    // Đẩy email vào queue
    const emailData: IOtpEmailData = {
      to: email,
      subject: this.getEmailSubject(type),
      template: this.getEmailTemplate(type),
      data: {
        otp,
        expiryMinutes: this.OTP_EXPIRY_MINUTES,
        email,
      },
    };

    await this.rabbitmqService.push(RoutingKey.sendOtpMail, emailData);
  }

  async verifyOtp(
    email: string,
    otp: string,
    type: OtpType,
  ): Promise<UserOtp> {
    this.logger.info('[verifyOtp]', { email, type });

    const userOtp = await this.userOtpRepository.findOne(
      { email, type, status: OtpStatus.PENDING, otp },
      { order: { createdAt: 'DESC' } },
    );

    if (!userOtp) {
      throw new UnauthorizedException(AuthError.INVALID_OTP);
    }

    if (userOtp.expiresAt < new Date()) {
      userOtp.status = OtpStatus.EXPIRED;
      await this.userOtpRepository.save(userOtp);
      throw new UnauthorizedException(AuthError.OTP_EXPIRED);
    }

    if (userOtp.otp !== otp) {
      throw new UnauthorizedException(AuthError.INVALID_OTP);
    }

    userOtp.status = OtpStatus.VERIFIED;
    userOtp.verifiedAt = new Date();
    await this.userOtpRepository.save(userOtp);

    await this.userOtpRepository.repository
      .createQueryBuilder()
      .update()
      .set({ status: OtpStatus.CANCELLED })
      .where('email = :email', { email })
      .andWhere('type = :type', { type })
      .andWhere('status = :status', { status: OtpStatus.PENDING })
      .andWhere('id != :id', { id: userOtp.id })
      .execute();

    // Xóa cache retry khi verify thành công
    const retryCacheKey = `${RedisKeyPrefix.OTP_RETRY}:${email}:${type}`;
    await this.redisService.del(retryCacheKey);

    return userOtp;
  }

  private getEmailSubject(type: OtpType): string {
    switch (type) {
      case OtpType.RESET_PASSWORD:
        return 'Đặt lại mật khẩu';
      case OtpType.VERIFY_EMAIL:
        return 'Xác thực email';
      case OtpType.CHANGE_EMAIL:
        return 'Thay đổi email';
      default:
        return 'Mã xác thực OTP';
    }
  }

  private getEmailTemplate(type: OtpType): string {
    switch (type) {
      case OtpType.RESET_PASSWORD:
        return 'reset-password';
      case OtpType.VERIFY_EMAIL:
        return 'verify-email';
      case OtpType.CHANGE_EMAIL:
        return 'change-email';
      default:
        return 'default-otp';
    }
  }
} 