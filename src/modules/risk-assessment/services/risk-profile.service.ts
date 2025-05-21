import { Injectable, NotFoundException } from '@nestjs/common';
import { RiskProfileRepository } from '../repositories/risk-profile.repository';
import { GetRiskProfilesDto } from '../dto/risk-profile/get-profiles.dto';
import { PgPagination } from '@/shared/mysqldb/types/pagination.type';
import { RiskProfile } from '../entities/risk-profile.entity';
import { CreateRiskProfileDto } from '../dto/risk-profile/create-profile.dto';
import { handleDatabaseError } from '@/shared/utils/db-error-handler';
import { UpdateRiskProfileDto } from '../dto/risk-profile/update-profile.dto';
import { LoggerService } from '@/shared/logger/logger.service';
import { RiskProfileType } from '../enums/risk-profile.enum';
import { RiskProfileTranslation } from '../entities/risk-profile-translation.entity';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';

@Injectable()
export class RiskProfileService {
  constructor(
    private readonly riskProfileRepository: RiskProfileRepository,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Lấy tất cả các hồ sơ rủi ro
   * @param query - Các tiêu chí lọc và phân trang
   * @returns Mảng các hồ sơ rủi ro và thông tin phân trang (nếu có)
   */
  async getAllRiskProfiles(query?: GetRiskProfilesDto): Promise<{ data: RiskProfile[], pagination?: PgPagination }> {
    this.logger.info('[getAllRiskProfiles]', { query });
    try {
      const page = query?.page || 1;
      const limit = query?.limit || 10;
      const sortBy = query?.sortBy || 'minScore';
      const sortDir = query?.sortDirection || 'ASC';
      const types = query?.type || [];
      
      // Create cache key - convert array to string for cache key
      const typesKey = Array.isArray(types) ? types.sort().join(',') : '';
      const cacheKey = `${RedisKeyPrefix.RISK_PROFILE}:p${page}:l${limit}:s${sortBy}:d${sortDir}:t${typesKey}`;
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cachedData);
      }
      
      let pagination = null;
      if (query?.page && query?.limit) {
        pagination = new PgPagination(query.page, query.limit);
      }
      
      const [profiles, totalCount] = await this.riskProfileRepository.findAllProfiles(query, pagination);
      
      if (pagination) {
        pagination.totalItems = totalCount;
      }
      
      const result = {
        data: profiles,
        pagination,
      };
      
      await this.redisService.set(cacheKey, JSON.stringify(result), RedisKeyTtl.THIRTY_DAYS);
      
      return result;
    } catch (error) {
      handleDatabaseError(error, 'RiskProfileService.getAllRiskProfiles');
    }
  }

  /**
   * Tạo nhiều hồ sơ rủi ro
   * @param profilesData - Danh sách các hồ sơ rủi ro cần tạo
   * @returns Mảng các hồ sơ rủi ro đã tạo
   */
  async createRiskProfiles(profilesData: CreateRiskProfileDto[]) {
    this.logger.info('[createRiskProfiles]', { profiles: profilesData });
    
    try {
      const profiles = await this.riskProfileRepository.repository.manager.transaction(async (manager) => {
        const savedProfiles: RiskProfile[] = [];
        
        for (const profileData of profilesData) {
          const { translations, ...profileInfo } = profileData;
          
          // Create risk profile
          const profile = manager.create(RiskProfile, profileInfo);
          const savedProfile = await manager.save(profile);
          
          // Create translations
          const translationEntities = translations.map(translation => 
            manager.create(RiskProfileTranslation, {
              ...translation,
              riskProfileId: savedProfile.id
            })
          );
          
          await manager.save(translationEntities);
          savedProfiles.push(savedProfile);
        }
        
        return savedProfiles;
      });

      // Clear cache after creating new profiles
      await this.clearProfileCache();
      
      return profiles;
    } catch (error) {
      handleDatabaseError(error, 'RiskProfileService.createRiskProfiles');
    }
  }

  /**
   * Lấy hồ sơ rủi ro và các phân bổ tài sản liên quan
   * @param id - ID của hồ sơ rủi ro
   * @returns Hồ sơ rủi ro và các phân bổ tài sản liên quan
   */
  async getRiskProfileWithAllocations(id: string): Promise<RiskProfile> {
    this.logger.info('[getRiskProfileWithAllocations]', { id });
    const profile = await this.riskProfileRepository.findById(id, {
      relations: ['allocations', 'allocations.assetClass', 'translations']
    });
    
    if (!profile) {
      throw new NotFoundException(`Risk profile with ID ${id} not found`);
    }
    
    return profile;
  }

  /**
   * Cập nhật hồ sơ rủi ro
   * @param id - ID của hồ sơ rủi ro
   * @param updateDto - Dữ liệu cập nhật
   * @returns Hồ sơ rủi ro đã cập nhật
   */
  async updateRiskProfile(id: string, updateDto: UpdateRiskProfileDto) {
    this.logger.info('[updateRiskProfile]', { id, updateData: updateDto });
    const profile = await this.getRiskProfileById(id);
    
    try {
      const result = await this.riskProfileRepository.repository.manager.transaction(async (manager) => {
        const { translations, ...profileInfo } = updateDto;
        
        // Update risk profile
        const updatedProfile = manager.merge(RiskProfile, profile, profileInfo);
        const savedProfile = await manager.save(updatedProfile);
        
        // Update translations if provided
        if (translations) {
          // Delete existing translations
          await manager.delete(RiskProfileTranslation, { riskProfileId: id });
          
          // Create new translations
          const translationEntities = translations.map(translation => 
            manager.create(RiskProfileTranslation, {
              ...translation,
              riskProfileId: id
            })
          );
          
          await manager.save(translationEntities);
        }
        
        return savedProfile;
      });

      // Clear cache after updating profile
      await this.clearProfileCache();
      
      return result;
    } catch (error) {
      handleDatabaseError(error, 'RiskProfileService.updateRiskProfile');
    }
  }

  /**
   * Xóa hồ sơ rủi ro
   * @param id - ID của hồ sơ rủi ro
   * @returns true nếu xóa thành công, false nếu không tìm thấy hồ sơ rủi ro
   */
  async deleteRiskProfile(id: string): Promise<boolean> {
    this.logger.info('[deleteRiskProfile]', { id });
    try {
      const result = await this.riskProfileRepository.repository.manager.transaction(async (manager) => {
        // Delete translations first
        await manager.delete(RiskProfileTranslation, { riskProfileId: id });
        // Then delete the profile
        const deleteResult = await manager.delete(RiskProfile, { id });
        return deleteResult.affected !== 0;
      });

      // Clear cache after deleting profile
      await this.clearProfileCache();
      
      return result;
    } catch (error) {
      handleDatabaseError(error, 'RiskProfileService.deleteRiskProfile');
    }
  }

  /**
   * Lấy hồ sơ rủi ro theo ID
   * @param id - ID của hồ sơ rủi ro
   * @returns Hồ sơ rủi ro
   */
  async getRiskProfileById(id: string): Promise<RiskProfile> {
    this.logger.info('[getRiskProfileById]', { id });
    const profile = await this.riskProfileRepository.findById(id, {
      relations: ['translations']
    });
    if (!profile) {
      throw new NotFoundException(`Risk profile with ID ${id} not found`);
    }
    return profile;
  }

  /**
   * Lấy tất cả các loại hồ sơ rủi ro
   * @returns Mảng các loại hồ sơ rủi ro
   */
  async getRiskProfileType(): Promise<RiskProfileType[]> {
    this.logger.info('[getRiskProfileType]');
    try {
      const cacheKey = `${RedisKeyPrefix.RISK_PROFILE}:types`;
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cachedData);
      }

      const types = Object.values(RiskProfileType);
      await this.redisService.set(cacheKey, JSON.stringify(types), RedisKeyTtl.THIRTY_DAYS);
      
      return types;
    } catch (error) {
      handleDatabaseError(error, 'RiskProfileService.getRiskProfileType');
    }
  }

  private async clearProfileCache(): Promise<void> {
    try {
      const prefix = this.redisService.buildKey(`${RedisKeyPrefix.RISK_PROFILE}`);
      await this.redisService.delWithPrefix(prefix);
      this.logger.debug(`Cleared cache with prefix: ${prefix}`);
    } catch (error) {
      this.logger.error(`Error clearing profile cache: ${error.message}`, error.stack);
      throw error;
    }
  }
}