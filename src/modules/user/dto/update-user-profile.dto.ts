import { IsArray, IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum InvestmentExperience {
  NONE = 'NONE',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum TimeHorizon {
  SHORT_TERM = 'SHORT_TERM', // 0-2 years
  MEDIUM_TERM = 'MEDIUM_TERM', // 2-5 years
  LONG_TERM = 'LONG_TERM', // 5+ years
}

export class InvestmentPreferencesDto {
  @IsArray()
  @IsOptional()
  investmentGoals?: string[];

  @IsArray()
  @IsOptional()
  preferredInvestmentTypes?: string[];

  @IsEnum(TimeHorizon)
  @IsOptional()
  timeHorizon?: TimeHorizon;
}

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsNumber()
  @IsOptional()
  annualIncome?: number;

  @IsEnum(InvestmentExperience)
  @IsOptional()
  investmentExperience?: InvestmentExperience;

  @IsNumber()
  @IsOptional()
  riskTolerance?: number;

  @IsObject()
  @IsOptional()
  @Type(() => InvestmentPreferencesDto)
  investmentPreferences?: InvestmentPreferencesDto;

  @IsNumber()
  @IsOptional()
  totalPortfolioValue?: number;
  
  @IsNumber()
  @IsOptional()
  monthlyExpenses?: number;
} 