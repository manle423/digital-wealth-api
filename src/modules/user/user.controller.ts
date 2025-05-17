import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { Request } from 'express';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const userId = req.user?.sub;
    return this.userService.findById(userId);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @UseGuards(JwtGuard)
  @Get('me/profile')
  async getCurrentUserProfile(@Req() req: Request) {
    const userId = req.user?.sub;
    return this.userService.getUserProfileComplete(userId);
  }

  @UseGuards(JwtGuard)
  @Put('me/profile')
  async updateCurrentUserProfile(
    @Req() req: Request,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const userId = req.user?.sub;
    return this.userService.updateUserProfile(userId, updateUserProfileDto);
  }
}
