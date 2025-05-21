import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RiskProfileType } from '../../enums/risk-profile.enum';
import { Language } from '@/shared/enums/language.enum';

export class UpdateRiskProfileTranslationDto {
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;
  
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateRiskProfileDto {
  @IsEnum(RiskProfileType)
  @IsOptional()
  type?: RiskProfileType;
  
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateRiskProfileTranslationDto)
  translations?: UpdateRiskProfileTranslationDto[];
  
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