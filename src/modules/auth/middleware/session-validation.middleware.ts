import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserAuthService } from '../services/user-auth.service';
import { extractTokenFromRequest, verifyAccessToken } from '../utils/token.utils';
import { AuthError } from '../enum/error.enum';

@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userAuthService: UserAuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = extractTokenFromRequest(req);
      
      if (token) {
        try {
          const payload = await verifyAccessToken(this.jwtService, token);
          
          if (payload?.sessionId) {
            // Kiểm tra session có còn active không
            const session = await this.userAuthService.getSessionBySessionId(payload.sessionId);
            
            if (!session || !session.isActive) {
              // Session đã bị deactivate → Clear cookies và reject request
              res.clearCookie('accessToken');
              res.clearCookie('refreshToken');
              throw new UnauthorizedException(AuthError.SESSION_EXPIRED);
            }
            
            // Session valid → Set user in request for downstream use
            req.user = payload;
          } else {
            // JWT không có sessionId → Token cũ hoặc invalid
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            throw new UnauthorizedException(AuthError.SESSION_EXPIRED);
          }
        } catch (jwtError) {
          // JWT invalid hoặc session expired
          res.clearCookie('accessToken');
          res.clearCookie('refreshToken');
          
          if (jwtError instanceof UnauthorizedException) {
            throw jwtError;
          }
          
          // JWT invalid → Clear cookies và reject
          throw new UnauthorizedException(AuthError.INVALID_TOKEN);
        }
      }
      // Nếu không có token, cho phép request tiếp tục (optional authentication)
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Log unexpected errors
      console.warn('Session validation failed:', error.message);
    }
    
    next();
  }
} 