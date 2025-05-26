import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { FinancialAnalysisService } from '../services/financial-analysis.service';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { CurrentUser } from '@/modules/auth/decorators/track-session.decorator';
import { MetricType } from '../enums/metric-type.enum';

@UseGuards(JwtGuard)
@Controller('financial-analysis')
export class FinancialAnalysisController {
  constructor(private readonly financialAnalysisService: FinancialAnalysisService) {}

  @Get('summary')
  async getFinancialSummary(@CurrentUser() user: any) {
    return await this.financialAnalysisService.getFinancialSummary(user.sub);
  }

  @Post('calculate')
  async calculateAllMetrics(@CurrentUser() user: any) {
    return await this.financialAnalysisService.calculateAllMetrics(user.sub);
  }

  @Get('metrics')
  async getMetricsByType(
    @CurrentUser() user: any,
    @Query('type', new ParseEnumPipe(MetricType)) type: MetricType
  ) {
    return await this.financialAnalysisService.getMetricsByType(user.sub, type);
  }

  @Get('metrics/latest')
  async getLatestMetric(
    @CurrentUser() user: any,
    @Query('type', new ParseEnumPipe(MetricType)) type: MetricType
  ) {
    return await this.financialAnalysisService.getLatestMetric(user.sub, type);
  }

  @Get('metrics/trend')
  async getMetricTrend(
    @CurrentUser() user: any,
    @Query('type', new ParseEnumPipe(MetricType)) type: MetricType,
    @Query('months', new ParseIntPipe({ optional: true })) months?: number
  ) {
    return await this.financialAnalysisService.getMetricTrend(user.sub, type, months);
  }
} 