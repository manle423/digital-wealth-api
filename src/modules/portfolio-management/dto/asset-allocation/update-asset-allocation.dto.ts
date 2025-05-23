import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Max, Min, ValidateNested } from "class-validator";

export class UpdateAssetAllocationDto {
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  percentage?: number;
}

export class AllocationItemDto {
  @IsUUID()
  @IsNotEmpty()
  assetClassId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentage: number;
}

export class BatchUpdateAllocationDto {
  @IsUUID()
  @IsNotEmpty()
  riskProfileId: string;
  
  @ValidateNested({ each: true })
  @Type(() => AllocationItemDto)
  @IsNotEmpty()
  allocations: AllocationItemDto[];
} 