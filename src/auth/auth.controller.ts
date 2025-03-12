import { UserService } from '@/user/user.service';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { JwtGuard } from './guards/jwt.guard';
import { RegisterDto } from './dto/register.dto';
import { Response, Request } from 'express';
import { IAuthResponse, IJwtPayload } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.userService.createUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<IAuthResponse> {
    return this.authService.login(dto, res);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<IAuthResponse> {
    const user = req?.user as IJwtPayload;
    return this.authService.refreshToken(user, res);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
