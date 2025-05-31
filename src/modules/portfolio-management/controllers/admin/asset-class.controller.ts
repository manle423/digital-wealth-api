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
import { UpdateAssetClassDto } from '@/modules/portfolio-management/dto/asset/update-asset-class.dto';
import { CreateMultipleAssetClassesDto } from '@/modules/portfolio-management/dto/asset/create-asset-class.dto';
import { GetAssetClassesDto } from '@/modules/portfolio-management/dto/asset/get-asset-classes.dto';
import { AssetClassService } from '@/modules/portfolio-management/services/asset-class.service';

@Controller('admin/portfolio-management/asset-classes')
@UseGuards(JwtGuard, AdminGuard)
export class AdminAssetClassController {
  constructor(private readonly assetClassService: AssetClassService) {}

  @Get()
  async getAssetClasses(@Query() query: GetAssetClassesDto) {
    return this.assetClassService.getAllAssetClasses(query);
  }

  @Get(':id')
  async getAssetClassById(@Param('id') id: string) {
    return this.assetClassService.getAssetClassById(id);
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
