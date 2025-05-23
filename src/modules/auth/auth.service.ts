import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { UserService } from '@/modules/user/user.service';
import { LoginDto } from './dto/login.dto';
import { compareSync, hashSync } from 'bcrypt';
import { AuthError } from './enum/error.enum';
import { IAuthResponse, IJwtPayload } from './types/auth.types';
import { generateTokens, setCookies, clearCookies } from './utils/token.utils';
import { LoggerService } from '@/shared/logger/logger.service';
import { OtpService } from './services/otp.service';
import { OtpType } from '@/modules/user/enums/otp-type.enum';
import { ResetPasswordDto } from './dto/forgot-password.dto';
import { OtpStatus } from '../user/enums/otp-status.enum';
import { UserOtpRepository } from '../user/repositories/user-otp.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly otpService: OtpService,
    private readonly userOtpRepository: UserOtpRepository,
  ) {}

  async login(dto: LoginDto, res: Response): Promise<IAuthResponse> {
    this.logger.info('[login]', { email: dto.email });
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
      role: user.role,
    };

    const tokens = await generateTokens(this.jwtService, payload);
    setCookies(res, tokens);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  async refreshToken(
    oldPayload: IJwtPayload,
    res: Response,
  ): Promise<IAuthResponse> {
    this.logger.info('[refreshToken]', { userId: oldPayload?.sub });
    if (
      !oldPayload ||
      !oldPayload.sub ||
      typeof oldPayload.email !== 'string'
    ) {
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
      role: user.role,
    };

    const tokens = await generateTokens(this.jwtService, payload);
    setCookies(res, tokens);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  async logout(res: Response) {
    this.logger.info('[logout]');
    clearCookies(res);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string, req: Request): Promise<{ message: string }> {
    this.logger.info('[forgotPassword]', { email });
    
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Vẫn trả về thành công để tránh leak thông tin
      return { message: 'If your email exists in our system, you will receive a password reset OTP.' };
    }

    await this.otpService.generateOtp(email, OtpType.RESET_PASSWORD, user.id, req);

    return { message: 'If your email exists in our system, you will receive a password reset OTP.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    this.logger.info('[resetPassword]');

    const verifiedOtp = await this.otpService.verifyOtp(
      dto.email,
      dto.token,
      OtpType.RESET_PASSWORD,
    );

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(AuthError.USER_NOT_FOUND);
    }

    // Hash mật khẩu mới
    const hashedPassword = hashSync(dto.newPassword, 10);
    await this.userService.updatePassword(user.id, hashedPassword);

    // Đánh dấu OTP đã sử dụng
    verifiedOtp.status = OtpStatus.USED;
    await this.userOtpRepository.save(verifiedOtp);

    return { message: 'Password has been reset successfully' };
  }
}
