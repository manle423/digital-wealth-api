import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AssetManagementService } from '../services/asset-management.service';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { UpdateAssetDto } from '../dto/update-asset.dto';
import { GetAssetsDto, UpdateAssetValueDto } from '../dto/get-assets.dto';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { CurrentUser } from '@/modules/auth/decorators/track-session.decorator';
import { UserAsset } from '../entities/user-asset.entity';
import { AssetCategory } from '../entities/asset-category.entity';
import { CreateAssetCategoryDto } from '../dto/create-asset-category.dto';

@UseGuards(JwtGuard)
@Controller('asset-management')
export class AssetManagementController {
  constructor(
    private readonly assetManagementService: AssetManagementService,
  ) {}

  @Get('assets')
  async getUserAssets(@CurrentUser() user: any, @Query() query: GetAssetsDto) {
    return await this.assetManagementService.getUserAssets(user.sub, query);
  }

  @Get('assets/:id')
  async getAssetById(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) assetId: string,
  ) {
    return await this.assetManagementService.getAssetById(user.sub, assetId);
  }

  @Post('assets')
  async createAsset(
    @CurrentUser() user: any,
    @Body() createAssetDto: CreateAssetDto,
  ) {
    return await this.assetManagementService.createAsset(
      user.sub,
      createAssetDto,
    );
  }

  @Put('assets/:id')
  async updateAsset(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) assetId: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return await this.assetManagementService.updateAsset(
      user.sub,
      assetId,
      updateAssetDto,
    );
  }

  @Delete('assets/:id')
  async deleteAsset(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) assetId: string,
  ) {
    await this.assetManagementService.deleteAsset(user.sub, assetId);
    return { message: 'Asset deleted successfully' };
  }

  @Put('assets/:id/value')
  async updateAssetValue(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) assetId: string,
    @Body() updateValueDto: UpdateAssetValueDto,
  ) {
    return await this.assetManagementService.updateAssetValue(
      user.sub,
      assetId,
      updateValueDto,
    );
  }

  @Get('summary/total-value')
  async getTotalAssetValue(@CurrentUser() user: any) {
    const totalValue = await this.assetManagementService.getTotalAssetValue(
      user.sub,
    );
    return { totalValue };
  }

  @Get('summary/breakdown')
  async getAssetBreakdown(@CurrentUser() user: any) {
    return await this.assetManagementService.getAssetBreakdown(user.sub);
  }

  @Get('categories')
  async getAssetCategories() {
    return await this.assetManagementService.getAssetCategories();
  }

  @Get('assets/liquid')
  async getLiquidAssets(@CurrentUser() user: any) {
    return await this.assetManagementService.getLiquidAssets(user.sub);
  }

  @Get('assets/recent')
  async getRecentlyUpdatedAssets(
    @CurrentUser() user: any,
    @Query('days') days?: number,
  ) {
    return await this.assetManagementService.getRecentlyUpdatedAssets(
      user.sub,
      days,
    );
  }

  @Post('categories')
  async createAssetCategory(
    @Body() createAssetCategoryDto: CreateAssetCategoryDto,
  ) {
    return await this.assetManagementService.createAssetCategory(
      createAssetCategoryDto,
    );
  }
}
