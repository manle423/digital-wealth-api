import { Injectable, NotFoundException } from "@nestjs/common";
import { AssetClassRepository } from "../repositories/asset-class.repository";
import { AssetClass } from "../entities/asset-class.entity";
import { handleDatabaseError } from "@/shared/utils/db-error-handler";
import { CreateAssetClassDto } from "../dto/asset/create-asset-class.dto";
import { PgPagination } from "@/shared/mysqldb/types/pagination.type";
import { GetAssetClassesDto } from "../dto/asset/get-asset-classes.dto";
import { UpdateAssetClassDto } from "../dto/asset/update-asset-class.dto";

@Injectable()
export class AssetClassService {
  constructor(
    private readonly assetClassRepository: AssetClassRepository
  ) {}

  async getAllAssetClasses(query?: GetAssetClassesDto): Promise<{ data: AssetClass[], pagination?: PgPagination }> {
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
    try {
      const assetClasses = assetClassesData.map(assetClassDto => ({
        ...assetClassDto,
        isActive: assetClassDto.isActive ?? true,
        order: assetClassDto.order ?? 0
      }));
      
      return await this.assetClassRepository.save(assetClasses) as AssetClass[];
    } catch (error) {
      handleDatabaseError(error, 'Asset Class');
    }
  }

  async updateAssetClass(id: string, updateDto: UpdateAssetClassDto): Promise<AssetClass> {
    const assetClass = await this.assetClassRepository.findById(id);
    if (!assetClass) {
      throw new NotFoundException(`Asset class with ID ${id} not found`);
    }
    
    const updated = { ...assetClass, ...updateDto };
    
    try {
      const result = await this.assetClassRepository.save(updated);
      return result[0] as AssetClass;
    } catch (error) {
      handleDatabaseError(error, 'Asset Class');
    }
  }

  async deleteAssetClass(id: string): Promise<boolean> {
    const result = await this.assetClassRepository.deleteById(id);
    return result.affected !== 0;
  }

  async getAssetClassById(id: string) {
    const assetClass = await this.assetClassRepository.findById(id);
    if (!assetClass) {
      throw new NotFoundException(`Asset class with ID ${id} not found`);
    }
    return assetClass;
  }
}