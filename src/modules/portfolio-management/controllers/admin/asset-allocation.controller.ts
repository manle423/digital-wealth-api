import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AssetAllocationService } from '@/modules/portfolio-management/services/asset-allocation.service';
import { CreateMultipleAssetClassesAllocationDto } from '@/modules/portfolio-management/dto/asset-allocation/create-asset-alllocation.dto';
import { BatchUpdateAllocationDto, UpdateAssetAllocationDto } from '@/modules/portfolio-management/dto/asset-allocation/update-asset-allocation.dto';

@Controller('admin/portfolio-management/asset-allocations')
@UseGuards(JwtGuard, AdminGuard)
export class AdminAssetAllocationController {
  constructor(
    private readonly assetAllocationService: AssetAllocationService,
  ) {}

  @Get()
  async getAllAllocations() {
    return this.assetAllocationService.getAllAllocations();
  }

  @Get('risk-profile/:riskProfileId')
  async getAllocationsByRiskProfile(@Param('riskProfileId') riskProfileId: string) {
    return this.assetAllocationService.getAllocationsByRiskProfile(riskProfileId);
  }

  @Post()
  async createAllocation(@Body() dto: CreateMultipleAssetClassesAllocationDto) {
    return this.assetAllocationService.createAllocation(dto.assetAllocations);
  }

  @Put(':id')
  async updateAllocation(
    @Param('id') id: string,
    @Body() dto: UpdateAssetAllocationDto,
  ) {
    return this.assetAllocationService.updateAllocation(id, dto);
  }

  @Post('batch')
  async batchUpdateAllocations(@Body() dto: BatchUpdateAllocationDto) {
    return this.assetAllocationService.batchUpdateAllocations(dto);
  }
} 