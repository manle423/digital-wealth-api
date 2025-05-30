import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
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

export enum RiskTolerance {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE'
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

export class UserDetailDto {
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  dateOfBirth?: Date;

  @IsString()
  phoneNumber?: string;

  @IsString()
  occupation?: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  annualIncome?: number;

  @IsEnum(InvestmentExperience)
  investmentExperience?: InvestmentExperience;

  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value === 'CONSERVATIVE') return 1;
      if (value === 'MODERATE') return 2;
      if (value === 'AGGRESSIVE') return 3;
      return Number(value);
    }
    return value || 1; // default to 1 (CONSERVATIVE) if undefined
  })
  riskTolerance?: number;

  @IsNumber()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return Number(value);
    }
    return value;
  })
  monthlyExpenses?: number;

  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return {
        monthlyExpenses: Number(value)
      };
    }
    return value;
  })
  investmentPreferences?: InvestmentPreferencesDto;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalPortfolioValue?: number;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsObject()
  @IsOptional()
  kycDetails?: any;
}

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @Type(() => UserDetailDto)
  userDetail?: UserDetailDto;
} 