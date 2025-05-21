import { IsArray, IsEnum, IsString, ValidateNested } from "class-validator";
import { IsNotEmpty, Max } from "class-validator";
import { Type } from "class-transformer";
import { Min } from "class-validator";
import { IsInt } from "class-validator";
import { RiskProfileType } from "../../enums/risk-profile.enum";
import { Language } from "@/shared/enums/language.enum";

export class CreateRiskProfileDto {
  @IsEnum(RiskProfileType)
  @IsNotEmpty()
  type: RiskProfileType;
  
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRiskProfileTranslationDto)
  translations: CreateRiskProfileTranslationDto[];
  
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minScore: number;
  
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  maxScore: number;
}

export class CreateRiskProfileTranslationDto {
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

export class CreateMultipleRiskProfilesDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRiskProfileDto)
  profiles: CreateRiskProfileDto[];
} 