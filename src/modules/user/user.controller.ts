import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CurrentUser } from '../auth/decorators/track-session.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user) {
    const userId = user.sub;
    return this.userService.findById(userId);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @UseGuards(JwtGuard)
  @Get('me/profile')
  async getCurrentUserProfile(@CurrentUser() user) {
    const userId = user.sub;
    return this.userService.getUserProfileComplete(userId);
  }

  @UseGuards(JwtGuard)
  @Put('me/profile')
  async updateCurrentUserProfile(
    @CurrentUser() user,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const userId = user.sub;
    return this.userService.updateUserProfile(userId, updateUserProfileDto);
  }

  @UseGuards(JwtGuard)
  @Get('me/get-finance-profile')
  async getCurrentUserFinanceProfile(@CurrentUser() user) {
    return this.userService.getUserFinanceProfile(user.sub);
  }

  @UseGuards(JwtGuard)
  @Delete('me/delete-cache')
  async deleteCache(@CurrentUser() user) {
    return this.userService.deleteCache(user.sub);
  }
}
