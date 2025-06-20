import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { extractTokenFromRequest, verifyAccessToken } from '../utils/token.utils';

@Injectable()
export class OptionalJwtGuard extends JwtGuard {
  constructor(protected readonly jwtService: JwtService) {
    super(jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromRequest(request);

    if (!token) {
      // Không có token vẫn cho phép request đi qua
      return true;
    }

    try {
      const payload = await verifyAccessToken(this.jwtService, token);
      request.user = payload;
    } catch {
      // Token không hợp lệ vẫn cho phép request đi qua
      return true;
    }

    return true;
  }
}
