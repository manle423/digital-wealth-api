import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsObject, Min, Max, IsUUID, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AssetType } from '../enums/asset-type.enum';

export class CreateAssetCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  codeName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}