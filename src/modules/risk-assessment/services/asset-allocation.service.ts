import { AssetAllocation } from "../entities/asset-allocation.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AssetAllocationRepository } from "../repositories/asset-allocation.repository";
import { handleDatabaseError } from "@/shared/utils/db-error-handler";
import { AssetClassService } from "./asset-class.service";
import { RiskProfileService } from "./risk-profile.service";
import { CreateAssetAllocationDto } from "../dto/asset-allocation/create-asset-alllocation.dto";
import { BatchUpdateAllocationDto, UpdateAssetAllocationDto } from "../dto/asset-allocation/update-asset-allocation.dto";

@Injectable()
export class AssetAllocationService {
  constructor(
    private readonly assetAllocationRepository: AssetAllocationRepository,
    private readonly assetClassService: AssetClassService,
    private readonly riskProfileService: RiskProfileService,
  ) {}

    // Asset Allocation methods
    async createAllocation(createDto: CreateAssetAllocationDto): Promise<AssetAllocation> {
      // Kiểm tra riskProfile tồn tại
      await this.riskProfileService.getRiskProfileById(createDto.riskProfileId);
      
      // Kiểm tra assetClass tồn tại
      const assetClass = await this.assetClassService.getAssetClassById(createDto.assetClassId);
      if (!assetClass) {
        throw new NotFoundException(`Asset class with ID ${createDto.assetClassId} not found`);
      }
      
      try {
        const allocations = await this.assetAllocationRepository.save(createDto);
        return allocations[0] as AssetAllocation;
      } catch (error) {
        handleDatabaseError(error, 'Asset Allocation');
      }
    }
  
    async updateAllocation(id: string, updateDto: UpdateAssetAllocationDto): Promise<AssetAllocation> {
      const allocation = await this.assetAllocationRepository.findById(id);
      if (!allocation) {
        throw new NotFoundException(`Allocation with ID ${id} not found`);
      }
      
      const updated = { ...allocation, ...updateDto };
      
      try {
        const result = await this.assetAllocationRepository.save(updated);
        return result[0] as AssetAllocation;
      } catch (error) {
        handleDatabaseError(error, 'Asset Allocation');
      }
    }
  
    async batchUpdateAllocations(dto: BatchUpdateAllocationDto): Promise<AssetAllocation[]> {
      // Kiểm tra profile tồn tại
      await this.riskProfileService.getRiskProfileById(dto.riskProfileId);
      
      try {
        // Xóa các phân bổ cũ
        await this.assetAllocationRepository.delete({
          riskProfileId: dto.riskProfileId
        });
        
        // Tạo các phân bổ mới
        const allocationsToCreate = dto.allocations.map(allocation => ({
          riskProfileId: dto.riskProfileId,
          assetClassId: allocation.assetClassId,
          percentage: allocation.percentage
        }));
        
        const result = await this.assetAllocationRepository.save(allocationsToCreate);
        return result as AssetAllocation[];
      } catch (error) {
        handleDatabaseError(error, 'Asset Allocation');
      }
    }
}