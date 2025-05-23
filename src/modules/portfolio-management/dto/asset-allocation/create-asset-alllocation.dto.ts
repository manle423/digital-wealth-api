import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsUUID, Max, Min, ValidateNested } from "class-validator";

export class CreateAssetAllocationDto {
  @IsUUID()
  @IsNotEmpty()
  riskProfileId: string;
  
  @IsUUID()
  @IsNotEmpty()
  assetClassId: string;
  
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentage: number;
}

export class CreateMultipleAssetClassesAllocationDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetAllocationDto)
  assetAllocations: CreateAssetAllocationDto[];
} 