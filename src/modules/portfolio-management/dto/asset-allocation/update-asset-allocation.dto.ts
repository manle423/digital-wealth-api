import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Max, Min } from "class-validator";

export class UpdateAssetAllocationDto {
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  percentage?: number;
}

export class BatchUpdateAllocationDto {
  @IsUUID()
  @IsNotEmpty()
  riskProfileId: string;
  
  @IsNotEmpty()
  allocations: {
    assetClassId: string;
    percentage: number;
  }[];
} 