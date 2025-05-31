import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserAsset } from '../entities/user-asset.entity';
import { AssetCategory } from '../entities/asset-category.entity';
import { LoggerService } from '@/shared/logger/logger.service';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { UserAssetRepository } from '../repositories/user-asset.repository';
import { AssetCategoryRepository } from '../repositories/asset-category.repository';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { UpdateAssetDto } from '../dto/update-asset.dto';
import { GetAssetsDto, UpdateAssetValueDto } from '../dto/get-assets.dto';
import { AssetType } from '../enums/asset-type.enum';
import { handleDatabaseError } from '@/shared/utils/db-error-handler';
import { CreateAssetCategoryDto } from '../dto/create-asset-category.dto';

@Injectable()
export class AssetManagementService {
  constructor(
    private readonly userAssetRepository: UserAssetRepository,
    private readonly assetCategoryRepository: AssetCategoryRepository,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
  ) {}

  async getUserAssets(
    userId: string,
    query?: GetAssetsDto,
  ): Promise<{
    assets: UserAsset[];
    total: number;
    summary: {
      totalValue: number;
      totalAssets: number;
      byCategory: any[];
      byType: any[];
    };
  }> {
    try {
      this.logger.info('[getUserAssets]', { userId, query });

      const queryHash = query ? this.hashQuery(query) : 'default';
      const cacheKey = `${RedisKeyPrefix.USER_ASSETS_LIST}:${userId}:${queryHash}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getUserAssets] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      let assets = await this.userAssetRepository.findByUserId(userId);

      // Apply filters
      if (query) {
        assets = this.applyFilters(assets, query);
        assets = this.applySorting(assets, query);
        assets = this.applyPagination(assets, query);
      }

      // Calculate summary
      const totalValue = await this.getTotalAssetValue(userId);
      const byCategory = await this.getAssetBreakdown(userId);
      const byType = await this.userAssetRepository.getAssetsByType(userId);

      const result = {
        assets,
        total: assets.length,
        summary: {
          totalValue,
          totalAssets: assets.length,
          byCategory,
          byType,
        },
      };

      await this.redisService.set(
        cacheKey,
        JSON.stringify(result),
        RedisKeyTtl.FIFTEEN_MINUTES,
      );

      return result;
    } catch (error) {
      this.logger.error('[getUserAssets] Error getting user assets', error);
      throw error;
    }
  }

  async getAssetById(userId: string, assetId: string): Promise<UserAsset> {
    try {
      this.logger.info('[getAssetById]', { userId, assetId });

      const asset = await this.userAssetRepository.findOne(
        { id: assetId, userId, isActive: true },
        { relations: ['category'] },
      );

      if (!asset) {
        throw new NotFoundException('Asset not found');
      }

      return asset;
    } catch (error) {
      this.logger.error('[getAssetById] Error getting asset', error);
      throw error;
    }
  }

  async createAsset(
    userId: string,
    createAssetDto: CreateAssetDto,
  ): Promise<UserAsset> {
    try {
      this.logger.info('[createAsset]', { userId, createAssetDto });

      // Verify category exists
      const category = await this.assetCategoryRepository.findById(
        createAssetDto.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Asset category not found');
      }

      const asset = new UserAsset();
      asset.userId = userId;
      asset.categoryId = createAssetDto.categoryId;
      asset.name = createAssetDto.name;
      asset.description = createAssetDto.description;
      asset.type = createAssetDto.type || AssetType.OTHER;
      asset.currentValue = createAssetDto.currentValue;
      asset.purchasePrice = createAssetDto.purchasePrice;
      asset.purchaseDate = createAssetDto.purchaseDate
        ? new Date(createAssetDto.purchaseDate)
        : null;
      asset.currency = createAssetDto.currency || 'VND';
      asset.annualReturn = createAssetDto.annualReturn;
      asset.marketValue =
        createAssetDto.marketValue || createAssetDto.currentValue;
      asset.valuationDate = createAssetDto.valuationDate
        ? new Date(createAssetDto.valuationDate)
        : new Date();
      asset.liquidityLevel = createAssetDto.liquidityLevel || 'MEDIUM';
      asset.additionalInfo = createAssetDto.additionalInfo;
      asset.notes = createAssetDto.notes;
      asset.lastUpdated = new Date();

      const savedAsset = await this.userAssetRepository.save(asset);

      // Clear caches
      await this.clearUserAssetCaches(userId);

      return savedAsset[0] as UserAsset;
    } catch (error) {
      this.logger.error('[createAsset] Error creating asset', error);
      handleDatabaseError(error, 'AssetManagementService.createAsset');
    }
  }

  async updateAsset(
    userId: string,
    assetId: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<UserAsset> {
    try {
      this.logger.info('[updateAsset]', { userId, assetId, updateAssetDto });

      const asset = await this.getAssetById(userId, assetId);

      // Update fields
      if (updateAssetDto.categoryId) {
        const category = await this.assetCategoryRepository.findById(
          updateAssetDto.categoryId,
        );
        if (!category) {
          throw new NotFoundException('Asset category not found');
        }
        asset.categoryId = updateAssetDto.categoryId;
      }

      Object.assign(asset, {
        ...updateAssetDto,
        lastUpdated: new Date(),
      });

      const updatedAsset = await this.userAssetRepository.save(asset);

      // Clear caches
      await this.clearUserAssetCaches(userId);

      return updatedAsset[0] as UserAsset;
    } catch (error) {
      this.logger.error('[updateAsset] Error updating asset', error);
      throw error;
    }
  }

  async deleteAsset(userId: string, assetId: string): Promise<void> {
    try {
      this.logger.info('[deleteAsset]', { userId, assetId });

      const asset = await this.getAssetById(userId, assetId);

      // Soft delete
      asset.isActive = false;
      await this.userAssetRepository.save(asset);

      // Clear caches
      await this.clearUserAssetCaches(userId);
    } catch (error) {
      this.logger.error('[deleteAsset] Error deleting asset', error);
      throw error;
    }
  }

  async updateAssetValue(
    userId: string,
    assetId: string,
    updateValueDto: UpdateAssetValueDto,
  ): Promise<UserAsset> {
    try {
      this.logger.info('[updateAssetValue]', {
        userId,
        assetId,
        updateValueDto,
      });

      const asset = await this.getAssetById(userId, assetId);

      asset.currentValue = updateValueDto.currentValue;
      if (updateValueDto.marketValue) {
        asset.marketValue = updateValueDto.marketValue;
      }
      if (updateValueDto.notes) {
        asset.notes = updateValueDto.notes;
      }
      asset.lastUpdated = new Date();
      asset.valuationDate = new Date();

      const updatedAsset = await this.userAssetRepository.save(asset);

      // Clear caches
      await this.clearUserAssetCaches(userId);

      return updatedAsset[0] as UserAsset;
    } catch (error) {
      this.logger.error('[updateAssetValue] Error updating asset value', error);
      throw error;
    }
  }

  async getTotalAssetValue(userId: string): Promise<number> {
    try {
      this.logger.info('[getTotalAssetValue]', { userId });

      const cacheKey = `${RedisKeyPrefix.USER_TOTAL_ASSETS}:${userId}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getTotalAssetValue] Cache hit', { cacheKey });
        return parseFloat(cached);
      }

      const totalValue =
        await this.userAssetRepository.getTotalValueByUserId(userId);

      await this.redisService.set(
        cacheKey,
        totalValue.toString(),
        RedisKeyTtl.THIRTY_MINUTES,
      );

      return totalValue;
    } catch (error) {
      this.logger.error(
        '[getTotalAssetValue] Error calculating total asset value',
        error,
      );
      throw error;
    }
  }

  async getAssetBreakdown(userId: string): Promise<
    {
      categoryId: string;
      categoryName: string;
      totalValue: number;
      percentage: number;
      assetCount: number;
    }[]
  > {
    try {
      this.logger.info('[getAssetBreakdown]', { userId });

      const cacheKey = `${RedisKeyPrefix.ASSET_BREAKDOWN}:${userId}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getAssetBreakdown] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      const breakdown =
        await this.userAssetRepository.getAssetBreakdownByUserId(userId);
      const totalValue = await this.getTotalAssetValue(userId);

      const result = breakdown.map((item) => ({
        ...item,
        totalValue: parseFloat(item.totalValue.toString()),
        assetCount: parseInt(item.assetCount.toString()),
        percentage:
          totalValue > 0
            ? (parseFloat(item.totalValue.toString()) / totalValue) * 100
            : 0,
      }));

      await this.redisService.set(
        cacheKey,
        JSON.stringify(result),
        RedisKeyTtl.THIRTY_MINUTES,
      );

      return result;
    } catch (error) {
      this.logger.error(
        '[getAssetBreakdown] Error getting asset breakdown',
        error,
      );
      throw error;
    }
  }

  async getAssetCategories(): Promise<AssetCategory[]> {
    try {
      this.logger.info('[getAssetCategories]');

      const cacheKey = `${RedisKeyPrefix.ASSET_CATEGORIES}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        this.logger.debug('[getAssetCategories] Cache hit', { cacheKey });
        return JSON.parse(cached);
      }

      const categories = await this.assetCategoryRepository.findAllActive();

      await this.redisService.set(
        cacheKey,
        JSON.stringify(categories),
        RedisKeyTtl.ONE_DAY,
      );

      return categories;
    } catch (error) {
      this.logger.error(
        '[getAssetCategories] Error getting asset categories',
        error,
      );
      throw error;
    }
  }

  async getLiquidAssets(userId: string): Promise<UserAsset[]> {
    try {
      this.logger.info('[getLiquidAssets]', { userId });

      return await this.userAssetRepository.getLiquidAssets(userId);
    } catch (error) {
      this.logger.error('[getLiquidAssets] Error getting liquid assets', error);
      throw error;
    }
  }

  async getRecentlyUpdatedAssets(
    userId: string,
    days: number = 30,
  ): Promise<UserAsset[]> {
    try {
      this.logger.info('[getRecentlyUpdatedAssets]', { userId, days });

      return await this.userAssetRepository.getRecentlyUpdatedAssets(
        userId,
        days,
      );
    } catch (error) {
      this.logger.error(
        '[getRecentlyUpdatedAssets] Error getting recently updated assets',
        error,
      );
      throw error;
    }
  }

  async createAssetCategory(createAssetCategoryDto: CreateAssetCategoryDto) {
    try {
      this.logger.info('[createAssetCategory]', { createAssetCategoryDto });

      const category = new AssetCategory();
      category.name = createAssetCategoryDto.name;
      category.description = createAssetCategoryDto.description;
      category.codeName = createAssetCategoryDto.codeName;
      category.isActive = createAssetCategoryDto.isActive || true;
      category.order = createAssetCategoryDto.order || 0;

      const savedCategory = await this.assetCategoryRepository.create(category);

      // Clear categories cache
      await this.redisService.del(`${RedisKeyPrefix.ASSET_CATEGORIES}`);

      return savedCategory;
    } catch (error) {
      this.logger.error(
        '[createAssetCategory] Error creating asset category',
        error,
      );
      handleDatabaseError(error, 'AssetManagementService.createAssetCategory');
    }
  }

  // Helper methods
  private hashQuery(query: GetAssetsDto): string {
    return Buffer.from(JSON.stringify(query))
      .toString('base64')
      .substring(0, 16);
  }

  private applyFilters(assets: UserAsset[], query: GetAssetsDto): UserAsset[] {
    let filtered = assets;

    if (query.categoryId) {
      filtered = filtered.filter(
        (asset) => asset.categoryId === query.categoryId,
      );
    }
    if (query.type) {
      filtered = filtered.filter((asset) => asset.type === query.type);
    }
    if (query.liquidityLevel) {
      filtered = filtered.filter(
        (asset) => asset.liquidityLevel === query.liquidityLevel,
      );
    }
    if (query.minValue !== undefined) {
      filtered = filtered.filter(
        (asset) => asset.currentValue >= query.minValue,
      );
    }
    if (query.maxValue !== undefined) {
      filtered = filtered.filter(
        (asset) => asset.currentValue <= query.maxValue,
      );
    }
    if (query.currency) {
      filtered = filtered.filter((asset) => asset.currency === query.currency);
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchLower) ||
          asset.description?.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }

  private applySorting(assets: UserAsset[], query: GetAssetsDto): UserAsset[] {
    if (!query.sortBy) return assets;

    const direction = query.sortDirection === 'DESC' ? -1 : 1;
    return assets.sort((a, b) => {
      const aValue = a[query.sortBy as keyof UserAsset];
      const bValue = b[query.sortBy as keyof UserAsset];
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });
  }

  private applyPagination(
    assets: UserAsset[],
    query: GetAssetsDto,
  ): UserAsset[] {
    if (!query.page || !query.limit) return assets;

    const startIndex = (query.page - 1) * query.limit;
    return assets.slice(startIndex, startIndex + query.limit);
  }

  private async clearUserAssetCaches(userId: string): Promise<void> {
    try {
      // Clear all user asset related caches
      const keysToDelete = [
        `${RedisKeyPrefix.USER_ASSETS_LIST}:${userId}:*`,
        `${RedisKeyPrefix.USER_TOTAL_ASSETS}:${userId}`,
        `${RedisKeyPrefix.ASSET_BREAKDOWN}:${userId}`,
        `${RedisKeyPrefix.NET_WORTH}:${userId}`,
        `${RedisKeyPrefix.FINANCIAL_METRICS}:${userId}`,
      ];

      await Promise.all(
        keysToDelete.map(async (pattern) => {
          if (pattern.includes('*')) {
            // For wildcard patterns, use delWithPrefix
            const prefix = pattern.replace(':*', '');
            await this.redisService.delWithPrefix(prefix);
          } else {
            // For exact keys, use del
            await this.redisService.del(pattern);
          }
        }),
      );

      this.logger.debug('[clearUserAssetCaches] Cleared all asset caches', {
        userId,
      });
    } catch (error) {
      this.logger.error(
        `[clearUserAssetCaches] Error clearing caches: ${error.message}`,
        { userId },
      );
    }
  }
}
