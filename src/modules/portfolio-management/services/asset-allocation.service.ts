import { AssetAllocation } from "../entities/asset-allocation.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AssetAllocationRepository } from "../repositories/asset-allocation.repository";
import { handleDatabaseError } from "@/shared/utils/db-error-handler";
import { AssetClassService } from "./asset-class.service";
import { RiskProfileService } from "./risk-profile.service";
import { CreateAssetAllocationDto } from "../dto/asset-allocation/create-asset-alllocation.dto";
import { BatchUpdateAllocationDto, UpdateAssetAllocationDto } from "../dto/asset-allocation/update-asset-allocation.dto";
import { LoggerService } from '@/shared/logger/logger.service';
import { RedisService } from "@/shared/redis/redis.service";
import { RedisKeyPrefix, RedisKeyTtl } from "@/shared/enums/redis-key.enum";

@Injectable()
export class AssetAllocationService {
  constructor(
    private readonly assetAllocationRepository: AssetAllocationRepository,
    private readonly assetClassService: AssetClassService,
    private readonly riskProfileService: RiskProfileService,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService
  ) { }

  // Get all asset allocations
  async getAllAllocations() {
    this.logger.info('[getAllAllocations]');
    
    // Tạo cache key cho tất cả allocations
    const cacheKey = `${RedisKeyPrefix.ASSET_ALLOCATION}:all`;
    
    // Kiểm tra cache trước
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    try {
      const allocations = await this.assetAllocationRepository.find({}, {
        relations: ['assetClass.translations', 'riskProfile.translations']
      });

      // Lưu vào cache
      await this.redisService.set(cacheKey, JSON.stringify(allocations), RedisKeyTtl.THIRTY_DAYS);
      this.logger.debug(`Cache set: ${cacheKey}`);
      
      return allocations;
    } catch (error) {
      this.logger.error(`Error in getAllAllocations: ${error.message}`);
      handleDatabaseError(error, 'AssetAllocationService.getAllAllocations');
    }
  }

  // Get asset allocations by risk profile ID
  async getAllocationsByRiskProfile(riskProfileId: string) {
    this.logger.info('[getAllocationsByRiskProfile]', { riskProfileId });
    
    // Kiểm tra risk profile tồn tại
    await this.riskProfileService.getRiskProfileById(riskProfileId);
    
    // Tạo cache key cho risk profile specific
    const cacheKey = `${RedisKeyPrefix.ASSET_ALLOCATION}:profile:${riskProfileId}`;
    
    // Kiểm tra cache trước
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    try {
      const allocations = await this.assetAllocationRepository.find({
        riskProfileId
      }, {
        relations: ['assetClass.translations', 'riskProfile.translations'],
        order: {
          'assetClass': {
            'order': 'ASC'
          }
        }
      });

      // Lưu vào cache
      await this.redisService.set(cacheKey, JSON.stringify(allocations), RedisKeyTtl.THIRTY_DAYS);
      this.logger.debug(`Cache set: ${cacheKey}`);
      
      return allocations;
    } catch (error) {
      this.logger.error(`Error in getAllocationsByRiskProfile: ${error.message}`);
      handleDatabaseError(error, 'AssetAllocationService.getAllocationsByRiskProfile');
    }
  }

  // Asset Allocation methods
  async createAllocation(createDtos: CreateAssetAllocationDto[]) {
    this.logger.info('[createAllocation]', { allocations: createDtos });
    
    // Kiểm tra riskProfile tồn tại cho tất cả các allocation
    const uniqueRiskProfileIds = [...new Set(createDtos.map(dto => dto.riskProfileId))];
    await Promise.all(
      uniqueRiskProfileIds.map(id => this.riskProfileService.getRiskProfileById(id))
    );
    
    // Kiểm tra assetClass tồn tại cho tất cả các allocation
    const uniqueAssetClassIds = [...new Set(createDtos.map(dto => dto.assetClassId))];
    const assetClasses = await Promise.all(
      uniqueAssetClassIds.map(id => this.assetClassService.getAssetClassById(id))
    );
    
    // Kiểm tra nếu có asset class nào không tồn tại
    const missingAssetClasses = uniqueAssetClassIds.filter(
      (id, index) => !assetClasses[index]
    );
    if (missingAssetClasses.length > 0) {
      throw new NotFoundException(
        `Asset classes with IDs ${missingAssetClasses.join(', ')} not found`
      );
    }
    
    try {
      // Tạo tất cả các allocation cùng lúc
      const allocations = await this.assetAllocationRepository.save(createDtos);
      
      // Xóa cache sau khi tạo mới
      await this.invalidateAssetAllocationCache();
      this.logger.debug('Cache invalidated after create');
      
      return allocations;
    } catch (error) {
      this.logger.error(`Error in createAllocation: ${error.message}`);
      handleDatabaseError(error, 'AssetAllocationService.createAllocation');
    }
  }

  async updateAllocation(id: string, updateDto: UpdateAssetAllocationDto) {
    this.logger.info('[updateAllocation]', { id, updateData: updateDto });
    const allocation = await this.assetAllocationRepository.findById(id);
    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }
    
    const updated = { ...allocation, ...updateDto };
    
    try {
      const result = await this.assetAllocationRepository.save(updated);
      
      // Xóa cache sau khi cập nhật
      await this.invalidateAssetAllocationCache();
      this.logger.debug('Cache invalidated after update');
      
      return result;
    } catch (error) {
      this.logger.error(`Error in updateAllocation: ${error.message}`);
      handleDatabaseError(error, 'AssetAllocationService.updateAllocation');
    }
  }

  async batchUpdateAllocations(dto: BatchUpdateAllocationDto) {
    this.logger.info('[batchUpdateAllocations]', { allocations: dto });
    // Kiểm tra profile tồn tại
    await this.riskProfileService.getRiskProfileById(dto.riskProfileId);
    
    try {
      // Xóa các phân bổ cũ (sử dụng hard delete)
      await this.assetAllocationRepository.hardDelete({
        riskProfileId: dto.riskProfileId
      });
      
      // Tạo các phân bổ mới
      const allocationsToCreate = dto.allocations.map(allocation => ({
        riskProfileId: dto.riskProfileId,
        assetClassId: allocation.assetClassId,
        percentage: allocation.percentage
      }));
      
      const result = await this.assetAllocationRepository.save(allocationsToCreate);
      
      // Xóa cache sau khi cập nhật hàng loạt
      await this.invalidateAssetAllocationCache();
      this.logger.debug('Cache invalidated after batch update');
      
      return result;
    } catch (error) {
      this.logger.error(`Error in batchUpdateAllocations: ${error.message}`);
      handleDatabaseError(error, 'AssetAllocationService.batchUpdateAllocations');
    }
  }

  private async invalidateAssetAllocationCache(): Promise<void> {
    try {
      // Xóa tất cả cache bắt đầu với prefix ASSET_ALLOCATION
      const prefix = this.redisService.buildKey(RedisKeyPrefix.ASSET_ALLOCATION);
      await this.redisService.delWithPrefix(prefix);
      this.logger.debug('Asset allocation cache invalidated');
    } catch (error) {
      this.logger.error(`Error invalidating asset allocation cache: ${error.message}`);
    }
  }
}