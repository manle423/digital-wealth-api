import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthError } from '../enum/error.enum';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookieOrHeader(request);

    if (!token) {
      throw new UnauthorizedException(AuthError.TOKEN_NOT_FOUND);
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_REFRESH_TOKEN_KEY,
        }
      );
      request.user = payload;
    } catch {
      throw new UnauthorizedException(AuthError.INVALID_TOKEN);
    }

    return true;
  }

  private extractTokenFromCookieOrHeader(request: Request): string | undefined {
    // Try to get token from cookie first
    const cookieToken = request.cookies?.refreshToken;
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to Authorization header
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Refresh' ? token : undefined;
  }
}
