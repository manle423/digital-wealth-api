import { Injectable, NotFoundException } from "@nestjs/common";
import { AssetClassRepository } from "../repositories/asset-class.repository";
import { AssetClass } from "../entities/asset-class.entity";
import { handleDatabaseError } from "@/shared/utils/db-error-handler";
import { CreateAssetClassDto } from "../dto/asset/create-asset-class.dto";
import { PgPagination } from "@/shared/mysqldb/types/pagination.type";
import { GetAssetClassesDto } from "../dto/asset/get-asset-classes.dto";
import { UpdateAssetClassDto } from "../dto/asset/update-asset-class.dto";
import { LoggerService } from '@/shared/logger/logger.service';

@Injectable()
export class AssetClassService {
  constructor(
    private readonly assetClassRepository: AssetClassRepository,
    private readonly logger: LoggerService
  ) {}

  async getAllAssetClasses(query?: GetAssetClassesDto): Promise<{ data: AssetClass[], pagination?: PgPagination }> {
    this.logger.info('[getAllAssetClasses]', { query });
    let pagination = null;
    
    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }
    
    const [assetClasses, totalCount] = await this.assetClassRepository.findAllAssetClasses(query, pagination);
    
    if (pagination) {
      pagination.totalItems = totalCount;
    }
    
    return {
      data: assetClasses,
      pagination,
    };
  }

  async createAssetClasses(assetClassesData: CreateAssetClassDto[]): Promise<AssetClass[]> {
    this.logger.info('[createAssetClasses]', { assetClasses: assetClassesData });
    try {
      const assetClasses = assetClassesData.map(assetClassDto => ({
        ...assetClassDto,
        isActive: assetClassDto.isActive ?? true,
        order: assetClassDto.order ?? 0
      }));
      
      return await this.assetClassRepository.save(assetClasses) as AssetClass[];
    } catch (error) {
      handleDatabaseError(error, 'AssetClassService.createAssetClasses');
    }
  }

  async updateAssetClass(id: string, updateDto: UpdateAssetClassDto): Promise<AssetClass> {
    this.logger.info('[updateAssetClass]', { id, updateData: updateDto });
    const assetClass = await this.assetClassRepository.findById(id);
    if (!assetClass) {
      throw new NotFoundException(`Asset class with ID ${id} not found`);
    }
    
    const updated = { ...assetClass, ...updateDto };
    
    try {
      const result = await this.assetClassRepository.save(updated);
      return result[0] as AssetClass;
    } catch (error) {
      handleDatabaseError(error, 'AssetClassService.updateAssetClass');
    }
  }

  async deleteAssetClass(id: string): Promise<boolean> {
    this.logger.info('[deleteAssetClass]', { id });
    const result = await this.assetClassRepository.deleteById(id);
    return result.affected !== 0;
  }

  async getAssetClassById(id: string) {
    this.logger.info('[getAssetClassById]', { id });
    const assetClass = await this.assetClassRepository.findById(id);
    if (!assetClass) {
      throw new NotFoundException(`Asset class with ID ${id} not found`);
    }
    return assetClass;
  }
}