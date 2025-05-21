import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { CreateMultipleRiskProfilesDto } from '@/modules/risk-assessment/dto/risk-profile/create-profile.dto';
import { UpdateRiskProfileDto } from '@/modules/risk-assessment/dto/risk-profile/update-profile.dto';
import { GetRiskProfilesDto } from '@/modules/risk-assessment/dto/risk-profile/get-profiles.dto';
import { RiskProfileService } from '@/modules/risk-assessment/services/risk-profile.service';

@Controller('admin/risk-assessment/profiles')
@UseGuards(JwtGuard, AdminGuard)
export class AdminRiskProfileController {
  constructor(
    private readonly riskProfileService: RiskProfileService,
  ) {}

  @Get()
  async getRiskProfiles(@Query() query: GetRiskProfilesDto) {
    return this.riskProfileService.getAllRiskProfiles(query);
  }

  @Get('risk-profile-type')
  async getRiskProfileType() {
    return this.riskProfileService.getRiskProfileType();
  }

  @Post()
  async createRiskProfiles(
    @Body() dto: CreateMultipleRiskProfilesDto,
  ) {
    return this.riskProfileService.createRiskProfiles(dto.profiles);
  }

  @Get(':id')
  async getRiskProfile(@Param('id') id: string) {
    return this.riskProfileService.getRiskProfileWithAllocations(id);
  }

  @Put(':id')
  async updateRiskProfile(
    @Param('id') id: string,
    @Body() dto: UpdateRiskProfileDto,
  ) {
    return this.riskProfileService.updateRiskProfile(id, dto);
  }

  @Delete(':id')
  async deleteRiskProfile(@Param('id') id: string) {
    return this.riskProfileService.deleteRiskProfile(id);
  }
} 