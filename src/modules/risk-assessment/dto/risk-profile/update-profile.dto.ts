import { Max, Min, IsInt, IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class UpdateRiskProfileDto {
  @IsString()
  @IsOptional()
  name?: string;
  
  @IsString()
  @IsOptional()
  description?: string;
  
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  minScore?: number;
  
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  maxScore?: number;
}