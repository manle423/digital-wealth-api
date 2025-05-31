import { Injectable } from '@nestjs/common';
import { UserAuthRepository } from '@/modules/user/repositories/user-auth.repository';
import { UserAuth } from '@/modules/user/entities/user-auth.entity';
import { DeviceInfoDto } from '../dto/device-info.dto';
import { LoggerService } from '@/shared/logger/logger.service';
import { Request } from 'express';
import { Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly userAuthRepository: UserAuthRepository,
    private readonly logger: LoggerService,
  ) {}

  async createOrUpdateSession(
    userId: string,
    deviceInfo: DeviceInfoDto,
    req: Request,
  ) {
    this.logger.info('[createOrUpdateSession]', {
      userId,
      deviceId: deviceInfo.deviceId,
    });

    // Tìm session hiện tại của device
    let userAuth = await this.userAuthRepository.findOne({
      userId,
      deviceId: deviceInfo.deviceId,
      isActive: true,
    });

    const ipAddress = this.getClientIp(req);
    const location = await this.getLocationFromIp(ipAddress);

    if (userAuth) {
      // Update session hiện tại
      userAuth.lastAccessAt = new Date();
      userAuth.deviceType = deviceInfo.deviceType || userAuth.deviceType;
      userAuth.deviceName = deviceInfo.deviceName || userAuth.deviceName;
      userAuth.deviceModel = deviceInfo.deviceModel || userAuth.deviceModel;
      userAuth.osVersion = deviceInfo.osVersion || userAuth.osVersion;
      userAuth.appVersion = deviceInfo.appVersion || userAuth.appVersion;
      userAuth.ipAddress = ipAddress;
      userAuth.location = location;

      this.logger.info('[updateSession]', { sessionId: userAuth.sessionId });
    } else {
      // Tạo session mới
      const sessionId = uuidv4();
      userAuth = new UserAuth();
      userAuth.userId = userId;
      userAuth.sessionId = sessionId;
      userAuth.deviceId = deviceInfo.deviceId;
      userAuth.deviceType = deviceInfo.deviceType;
      userAuth.deviceName = deviceInfo.deviceName;
      userAuth.deviceModel = deviceInfo.deviceModel;
      userAuth.osVersion = deviceInfo.osVersion;
      userAuth.appVersion = deviceInfo.appVersion;
      userAuth.ipAddress = ipAddress;
      userAuth.location = location;
      userAuth.lastAccessAt = new Date();
      userAuth.isActive = true;
      userAuth.isTrusted = false;

      this.logger.info('[createSession]', { sessionId });
    }

    const savedUserAuthArray = await this.userAuthRepository.save(userAuth);
    const savedUserAuth = savedUserAuthArray[0] as UserAuth;
    return savedUserAuth;
  }

  async updateLastAccess(sessionId: string, req: Request): Promise<void> {
    const ipAddress = this.getClientIp(req);

    await this.userAuthRepository.repository
      .createQueryBuilder()
      .update()
      .set({
        lastAccessAt: new Date(),
        ipAddress,
      })
      .where('sessionId = :sessionId', { sessionId })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
  }

  async deactivateSession(userId: string, deviceId: string): Promise<void> {
    this.logger.info('[deactivateSession]', { userId, deviceId });

    await this.userAuthRepository.repository
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('userId = :userId', { userId })
      .andWhere('deviceId = :deviceId', { deviceId })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
  }

  async deactivateSessionBySessionId(sessionId: string): Promise<void> {
    this.logger.info('[deactivateSessionBySessionId]', { sessionId });

    await this.userAuthRepository.repository
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('sessionId = :sessionId', { sessionId })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
  }

  async deactivateAllSessions(
    userId: string,
    exceptDeviceId?: string,
  ): Promise<void> {
    this.logger.info('[deactivateAllSessions]', { userId, exceptDeviceId });

    const queryBuilder = this.userAuthRepository.repository
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('userId = :userId', { userId })
      .andWhere('isActive = :isActive', { isActive: true });

    if (exceptDeviceId) {
      queryBuilder.andWhere('deviceId != :exceptDeviceId', { exceptDeviceId });
    }

    await queryBuilder.execute();
  }

  async getActiveSessions(userId: string): Promise<UserAuth[]> {
    return this.userAuthRepository.find(
      {
        userId,
        isActive: true,
      },
      {
        order: {
          lastAccessAt: 'DESC',
        },
      },
    );
  }

  async getSessionBySessionId(sessionId: string): Promise<UserAuth | null> {
    return this.userAuthRepository.findOne({
      sessionId,
      isActive: true,
    });
  }

  async trustDevice(userId: string, deviceId: string): Promise<void> {
    this.logger.info('[trustDevice]', { userId, deviceId });

    await this.userAuthRepository.repository
      .createQueryBuilder()
      .update()
      .set({
        isTrusted: true,
        trustedAt: new Date(),
      })
      .where('userId = :userId', { userId })
      .andWhere('deviceId = :deviceId', { deviceId })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
  }

  async untrustDevice(userId: string, deviceId: string): Promise<void> {
    this.logger.info('[untrustDevice]', { userId, deviceId });

    await this.userAuthRepository.repository
      .createQueryBuilder()
      .update()
      .set({
        isTrusted: false,
        trustedAt: null,
      })
      .where('userId = :userId', { userId })
      .andWhere('deviceId = :deviceId', { deviceId })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();
  }

  async isDeviceTrusted(userId: string, deviceId: string): Promise<boolean> {
    const userAuth = await this.userAuthRepository.findOne({
      userId,
      deviceId,
      isActive: true,
      isTrusted: true,
    });

    return !!userAuth;
  }

  async canLogoutOtherDevices(sessionId: string): Promise<boolean> {
    const session = await this.getSessionBySessionId(sessionId);
    // Chỉ device trusted mới có thể logout device khác
    return session?.isTrusted || false;
  }

  async validateLogoutPermission(
    sessionId: string,
    targetDeviceId: string,
  ): Promise<{
    canLogout: boolean;
    isCurrentDevice: boolean;
    currentSession: UserAuth | null;
  }> {
    const currentSession = await this.getSessionBySessionId(sessionId);
    const isCurrentDevice = currentSession?.deviceId === targetDeviceId;

    // User luôn có thể logout device hiện tại của mình
    if (isCurrentDevice) {
      return {
        canLogout: true,
        isCurrentDevice: true,
        currentSession,
      };
    }

    // Để logout device khác, device hiện tại phải trusted
    const canLogout = currentSession?.isTrusted || false;

    return {
      canLogout,
      isCurrentDevice: false,
      currentSession,
    };
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  private async getLocationFromIp(ip: string): Promise<string> {
    // Placeholder for IP geolocation service
    // You can integrate with services like MaxMind, IPStack, etc.
    if (
      ip === 'unknown' ||
      ip.startsWith('127.') ||
      ip.startsWith('192.168.')
    ) {
      return 'Local';
    }
    return 'Unknown Location';
  }
}
