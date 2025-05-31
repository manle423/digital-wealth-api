import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserAuthService } from './user-auth.service';
import {
  extractTokenFromRequest,
  verifyAccessToken,
} from '../utils/token.utils';
import { LoggerService } from '@/shared/logger/logger.service';

@Injectable()
export class SessionTrackerService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userAuthService: UserAuthService,
    private readonly logger: LoggerService,
  ) {}

  async trackSessionAccess(req: Request): Promise<void> {
    try {
      const token = extractTokenFromRequest(req);

      if (token) {
        const payload = await verifyAccessToken(this.jwtService, token);

        if (payload?.sessionId) {
          // Cập nhật last access time
          await this.userAuthService.updateLastAccess(payload.sessionId, req);
          this.logger.debug('[trackSessionAccess] Updated session access', {
            sessionId: payload.sessionId,
            userId: payload.sub,
          });
        }
      }
    } catch (error) {
      // Log error nhưng không throw để không ảnh hưởng request flow
      this.logger.warn('[trackSessionAccess] Failed to track session', {
        error,
      });
    }
  }

  async trackSessionAccessAsync(req: Request): Promise<void> {
    // Version không đồng bộ để sử dụng trong middleware
    this.trackSessionAccess(req).catch((error) => {
      console.error('Failed to track session access:', error);
    });
  }
}
