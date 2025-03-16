import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { UserService } from '@/user/user.service';
import { LoginDto } from './dto/login.dto';
import { compareSync } from 'bcrypt';
import { AuthError } from './enum/error.enum';
import { IAuthResponse, IJwtPayload } from './types/auth.types';
import { generateTokens, setCookies, clearCookies } from './utils/token.utils';
import { LoggerService } from '@/shared/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) { }

  async login(dto: LoginDto, res: Response): Promise<IAuthResponse> {
    this.logger.info('[login]');
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(AuthError.INVALID_CREDENTIALS);
    }

    const isPasswordValid = compareSync(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthError.INVALID_CREDENTIALS);
    }

    const payload: IJwtPayload = {
      sub: user.id.toString(),
      email: user.email,
    };

    const tokens = await generateTokens(this.jwtService, payload);
    setCookies(res, tokens);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tokens,
    };
  }

  async refreshToken(oldPayload: IJwtPayload, res: Response): Promise<IAuthResponse> {
    this.logger.info('refresh-token');
    if (!oldPayload || !oldPayload.sub || typeof oldPayload.email !== 'string') {
      throw new UnauthorizedException(AuthError.INVALID_TOKEN);
    }

    const userId = oldPayload.sub;

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException(AuthError.USER_NOT_FOUND);
    }

    const payload: IJwtPayload = {
      sub: user.id.toString(),
      email: user.email,
    };

    const tokens = await generateTokens(this.jwtService, payload);
    setCookies(res, tokens);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tokens,
    };
  }

  async logout(res: Response) {
    this.logger.info('[logout]');
    clearCookies(res);
    return { message: 'Logged out successfully' };
  }
}
