import { UserService } from '@/modules/user/user.service';
import { Body, Controller, Post, Req, Res, UseGuards, Get, Param, Delete } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { JwtGuard } from './guards/jwt.guard';
import { RegisterDto } from './dto/register.dto';
import { Response, Request } from 'express';
import { IAuthResponse, IJwtPayload } from './types/auth.types';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { UserAuthService } from './services/user-auth.service';
import { CurrentUser, SessionInfo } from './decorators/track-session.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly userAuthService: UserAuthService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.userService.createUser(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthResponse> {
    return this.authService.login(dto, req, res);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(
    @CurrentUser() user: IJwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthResponse> {
    return this.authService.refreshToken(user, req, res);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(
    @SessionInfo() session: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(session.userId, session.sessionId, res);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.forgotPassword(dto.email, req);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // Device Management Endpoints
  @UseGuards(JwtGuard)
  @Get('devices')
  async getDevices(@SessionInfo() session: any) {
    return this.userAuthService.getActiveSessions(session.userId);
  }

  @UseGuards(JwtGuard)
  @Post('devices/logout-all')
  async logoutAllDevices(
    @SessionInfo() session: any,
    @Body() dto: { exceptCurrentDevice?: boolean },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (dto.exceptCurrentDevice && session.sessionId) {
      // Tìm deviceId của session hiện tại
      const currentSession = await this.userAuthService.getSessionBySessionId(session.sessionId);
      await this.userAuthService.deactivateAllSessions(session.userId, currentSession?.deviceId);
    } else {
      await this.userAuthService.deactivateAllSessions(session.userId);
      // Clear cookies nếu logout tất cả
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }

    return { message: 'Logged out from devices successfully' };
  }

  @UseGuards(JwtGuard)
  @Delete('devices/:deviceId')
  async logoutDevice(
    @SessionInfo() session: any,
    @Param('deviceId') deviceId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Kiểm tra xem có phải device hiện tại không
    let isCurrentDevice = false;
    if (session.sessionId) {
      const currentSession = await this.userAuthService.getSessionBySessionId(session.sessionId);
      isCurrentDevice = currentSession?.deviceId === deviceId;
    }

    await this.userAuthService.deactivateSession(session.userId, deviceId);

    // Nếu logout device hiện tại, clear cookies
    if (isCurrentDevice) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }

    return { message: 'Device logged out successfully' };
  }

  @UseGuards(JwtGuard)
  @Post('devices/:deviceId/trust')
  async trustDevice(
    @SessionInfo() session: any,
    @Param('deviceId') deviceId: string,
  ) {
    await this.userAuthService.trustDevice(session.userId, deviceId);
    return { message: 'Device trusted successfully' };
  }

  @UseGuards(JwtGuard)
  @Delete('devices/:deviceId/trust')
  async untrustDevice(
    @SessionInfo() session: any,
    @Param('deviceId') deviceId: string,
  ) {
    await this.userAuthService.untrustDevice(session.userId, deviceId);
    return { message: 'Device untrusted successfully' };
  }
}
