import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { NetWorthService } from '../services/net-worth.service';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { CurrentUser } from '@/modules/auth/decorators/track-session.decorator';

@UseGuards(JwtGuard)
@Controller('net-worth')
export class NetWorthController {
  constructor(private readonly netWorthService: NetWorthService) {}

  @Get('current')
  async getCurrentNetWorth(@CurrentUser() user: any) {
    return await this.netWorthService.calculateCurrentNetWorth(user.sub);
  }

  @Get('summary')
  async getNetWorthSummary(@CurrentUser() user: any) {
    return await this.netWorthService.getNetWorthSummary(user.sub);
  }

  @Get('trend')
  async getNetWorthTrend(@CurrentUser() user: any) {
    return await this.netWorthService.getNetWorthTrend(user.sub);
  }

  @Get('history')
  async getNetWorthHistory(
    @CurrentUser() user: any,
    @Query('months', new ParseIntPipe({ optional: true })) months?: number,
  ) {
    return await this.netWorthService.getNetWorthHistory(user.sub, months);
  }

  @Post('snapshot')
  async createSnapshot(@CurrentUser() user: any) {
    return await this.netWorthService.createSnapshot(user.sub, true);
  }
}
