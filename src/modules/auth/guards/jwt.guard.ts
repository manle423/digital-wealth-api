import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthError } from '../enum/error.enum';
import {
  extractTokenFromRequest,
  verifyAccessToken,
} from '../utils/token.utils';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(protected readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException(AuthError.TOKEN_NOT_FOUND);
    }

    try {
      const payload = await verifyAccessToken(this.jwtService, token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException(AuthError.INVALID_TOKEN);
    }

    return true;
  }
}
