import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import {
  Body,
  Controller,
  Post,
  Put,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AssetAllocationService } from '@/modules/risk-assessment/services/asset-allocation.service';
import { CreateAssetAllocationDto } from '@/modules/risk-assessment/dto/asset-allocation/create-asset-alllocation.dto';
import { BatchUpdateAllocationDto, UpdateAssetAllocationDto } from '@/modules/risk-assessment/dto/asset-allocation/update-asset-allocation.dto';

@Controller('admin/risk-assessment/allocations')
@UseGuards(JwtGuard, AdminGuard)
export class AdminAssetAllocationController {
  constructor(
    private readonly assetAllocationService: AssetAllocationService,
  ) {}

  @Post()
  async createAllocation(@Body() dto: CreateAssetAllocationDto) {
    return this.assetAllocationService.createAllocation(dto);
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