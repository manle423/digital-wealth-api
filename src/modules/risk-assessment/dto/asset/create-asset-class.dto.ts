import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateAssetClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
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

export class CreateMultipleAssetClassesDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetClassDto)
  assetClasses: CreateAssetClassDto[];
} 