import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Language } from "@/shared/enums/language.enum";

export class CreateAssetClassDto {
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
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetClassTranslationDto)
  translations: CreateAssetClassTranslationDto[];

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;
  
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateAssetClassTranslationDto {
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

export class CreateMultipleAssetClassesDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetClassDto)
  assetClasses: CreateAssetClassDto[];
} 