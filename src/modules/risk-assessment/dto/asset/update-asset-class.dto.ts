import { Type } from "class-transformer";
import { IsOptional, IsString, IsInt, IsBoolean, Min } from "class-validator";

export class UpdateAssetClassDto {
  @IsString()
  @IsOptional()
  name?: string;
  
  @IsString()
  @IsOptional()
  description?: string;
  
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;
  
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}