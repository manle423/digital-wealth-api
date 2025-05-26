import { Injectable, NotFoundException } from "@nestjs/common";
import { AssetClassRepository } from "../repositories/asset-class.repository";
import { AssetClass } from "../entities/asset-class.entity";
import { handleDatabaseError } from "@/shared/utils/db-error-handler";
import { CreateAssetClassDto } from "../dto/asset/create-asset-class.dto";
import { PgPagination } from "@/shared/mysqldb/types/pagination.type";
import { GetAssetClassesDto } from "../dto/asset/get-asset-classes.dto";
import { UpdateAssetClassDto } from "../dto/asset/update-asset-class.dto";
import { LoggerService } from '@/shared/logger/logger.service';
import { AssetClassTranslationRepository } from "../repositories/asset-class-translation.repository";
import { RedisService } from "@/shared/redis/redis.service";
import { RedisKeyPrefix, RedisKeyTtl } from "@/shared/enums/redis-key.enum";
import { In } from "typeorm";
import { Language } from "@/shared/enums/language.enum";

@Injectable()
export class AssetClassService {
  constructor(
    private readonly assetClassRepository: AssetClassRepository,
    private readonly assetClassTranslationRepository: AssetClassTranslationRepository,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService
  ) {}

  async getAllAssetClasses(query?: GetAssetClassesDto): Promise<{ data: AssetClass[], pagination?: PgPagination }> {
    this.logger.info('[getAllAssetClasses]', { query });
    
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const sortBy = query?.sortBy || 'order';
    const sortDir = query?.sortDirection || 'ASC';
    const isActive = query?.isActive || '';
    
    // Tạo cache key dựa trên tất cả tham số truy vấn
    const cacheKey = `${RedisKeyPrefix.ASSET_CLASS}:p${page}:l${limit}:s${sortBy}:d${sortDir}:a${isActive}`;
    
    // Kiểm tra cache trước
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    // Nếu không có trong cache, truy vấn database như bình thường
    let pagination = null;
    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }
    
    const [assetClasses, totalCount] = await this.assetClassRepository.findAllAssetClasses(query, pagination);
    
    if (pagination) {
      pagination.totalItems = totalCount;
    }
    
    if (!(assetClasses && assetClasses.length)) {
      return { data: [], pagination };
    }
    
    // Lấy translations cho tất cả asset classes
    const assetClassIds = assetClasses.map(ac => ac.id);
    const translations = await this.assetClassTranslationRepository.find({
      assetClassId: In(assetClassIds)
    });
    
    // Gộp translations vào asset classes
    const assetClassesWithTranslations = assetClasses.map(assetClass => {
      const assetClassTranslations = translations.filter(t => t.assetClassId === assetClass.id);
      return {
        ...assetClass,
        translations: assetClassTranslations,
        name: assetClassTranslations.find(t => t.language === Language.VI)?.name,
        description: assetClassTranslations.find(t => t.language === Language.VI)?.description
      };
    });
    
    const result = {
      data: assetClassesWithTranslations,
      pagination,
    };
    
    // Lưu kết quả vào cache
    await this.redisService.set(cacheKey, JSON.stringify(result), RedisKeyTtl.THIRTY_DAYS);
    
    return result;
  }

  async getAssetClassById(id: string) {
    this.logger.info('[getAssetClassById]', { id });
    
    // Tạo cache key cho asset class cụ thể
    const cacheKey = `${RedisKeyPrefix.ASSET_CLASS}:id:${id}`;
    
    // Kiểm tra cache trước
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    // Lấy thông tin asset class
    const assetClass = await this.assetClassRepository.findById(id);
    if (!assetClass) {
      throw new NotFoundException(`Asset class with ID ${id} not found`);
    }
    
    // Lấy translations của asset class
    const translations = await this.assetClassTranslationRepository.find({
      assetClassId: id
    });
    
    // Gộp translations vào asset class
    const assetClassWithTranslations = {
      ...assetClass,
      translations,
      name: translations.find(t => t.language === Language.VI)?.name,
      description: translations.find(t => t.language === Language.VI)?.description
    };
    
    // Lưu vào cache
    await this.redisService.set(cacheKey, JSON.stringify(assetClassWithTranslations), RedisKeyTtl.THIRTY_DAYS);
    
    return assetClassWithTranslations;
  }

  async createAssetClasses(assetClassesData: CreateAssetClassDto[]) {
    this.logger.info('[createAssetClasses]', { assetClasses: assetClassesData });
    try {
      const assetClasses = await Promise.all(
        assetClassesData.map(async (assetClassDto) => {
          const { translations, ...assetClassInfo } = assetClassDto;
          
          // Tạo asset class
          const assetClass = await this.assetClassRepository.save({
            ...assetClassInfo,
            isActive: assetClassInfo.isActive ?? true,
            order: assetClassInfo.order ?? 0
          });
          
          // Tạo translations
          if (translations && translations.length > 0) {
            await this.assetClassTranslationRepository.save(
              translations.map(translation => ({
                assetClassId: assetClass[0].id,
                language: translation.language,
                name: translation.name,
                description: translation.description || ''
              }))
            );
          }
          
          return assetClass;
        })
      );
      
      // Xóa cache nếu có
      await this.invalidateAssetClassCache();
      
      return assetClasses;
    } catch (error) {
      this.logger.error(`Error in createAssetClasses: ${error.message}`);
      handleDatabaseError(error, 'AssetClassService.createAssetClasses');
    }
  }

  async updateAssetClass(id: string, updateDto: UpdateAssetClassDto) {
    this.logger.info('[updateAssetClass]', { id, updateData: updateDto });
    const assetClass = await this.assetClassRepository.findById(id);
    if (!assetClass) {
      throw new NotFoundException(`Asset class with ID ${id} not found`);
    }
    
    try {
      const { translations, ...assetClassInfo } = updateDto;
      
      // Update asset class
      const updated = { ...assetClass, ...assetClassInfo };
      const result = await this.assetClassRepository.save(updated);
      
      // Update translations if provided
      if (translations && translations.length > 0) {
        // Delete existing translations
        await this.assetClassTranslationRepository.delete({ assetClassId: id });
        
        // Create new translations
        await this.assetClassTranslationRepository.save(
          translations.map(translation => ({
            assetClassId: id,
            language: translation.language,
            name: translation.name,
            description: translation.description || ''
          }))
        );
      }
      
      // Xóa cache sau khi cập nhật
      await this.invalidateAssetClassCache();
      
      return result;
    } catch (error) {
      this.logger.error(`Error in updateAssetClass: ${error.message}`);
      handleDatabaseError(error, 'AssetClassService.updateAssetClass');
    }
  }

  async deleteAssetClass(id: string): Promise<boolean> {
    this.logger.info('[deleteAssetClass]', { id });
    try {
      // Thực hiện xóa trong một transaction
      const result = await this.assetClassRepository.repository.manager.transaction(async manager => {
        // Xóa translations trước
        await manager.delete('risk_assessment_asset_class_translations', { assetClassId: id });
        
        // Sau đó xóa asset class
        const deleteResult = await manager.delete(AssetClass, { id });
        return deleteResult.affected !== 0;
      });
      
      // Xóa cache nếu xóa thành công
      if (result) {
        await this.invalidateAssetClassCache();
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error in deleteAssetClass: ${error.message}`);
      handleDatabaseError(error, 'AssetClassService.deleteAssetClass');
    }
  }

  private async invalidateAssetClassCache(): Promise<void> {
    try {
      // Xóa tất cả cache bắt đầu với prefix ASSET_CLASS
      await this.redisService.delWithPrefix(`${RedisKeyPrefix.ASSET_CLASS}`);
      this.logger.debug('[invalidateAssetClassCache] Asset class cache invalidated');
    } catch (error) {
      this.logger.error(`[invalidateAssetClassCache] Error invalidating cache: ${error.message}`);
    }
  }
}