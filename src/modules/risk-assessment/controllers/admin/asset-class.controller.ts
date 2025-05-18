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
import { UpdateAssetClassDto } from '@/modules/risk-assessment/dto/asset/update-asset-class.dto';
import { CreateMultipleAssetClassesDto } from '@/modules/risk-assessment/dto/asset/create-asset-class.dto';
import { GetAssetClassesDto } from '@/modules/risk-assessment/dto/asset/get-asset-classes.dto';
import { AssetClassService } from '@/modules/risk-assessment/services/asset-class.service';

@Controller('admin/risk-assessment/asset-classes')
@UseGuards(JwtGuard, AdminGuard)
export class AdminAssetClassController {
  constructor(
    private readonly assetClassService: AssetClassService,
  ) {}

  @Get()
  async getAssetClasses(@Query() query: GetAssetClassesDto) {
    return this.assetClassService.getAllAssetClasses(query);
  }

  @Post()
  async createAssetClasses(@Body() dto: CreateMultipleAssetClassesDto) {
    return this.assetClassService.createAssetClasses(dto.assetClasses);
  }

  @Put(':id')
  async updateAssetClass(
    @Param('id') id: string,
    @Body() dto: UpdateAssetClassDto,
  ) {
    return this.assetClassService.updateAssetClass(id, dto);
  }

  @Delete(':id')
  async deleteAssetClass(@Param('id') id: string) {
    return this.assetClassService.deleteAssetClass(id);
  }
} 