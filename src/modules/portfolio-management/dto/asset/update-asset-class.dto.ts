import { Language } from '@/shared/enums/language.enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateAssetClassTranslationDto {
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAssetClassDto {
  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  riskLevel?: number;

  @Min(0)
  @IsOptional()
  @Type(() => Number)
  expectedReturn?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateAssetClassTranslationDto)
  translations?: UpdateAssetClassTranslationDto[];

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
