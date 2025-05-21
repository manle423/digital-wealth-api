import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsUUID, Max, Min } from "class-validator";

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