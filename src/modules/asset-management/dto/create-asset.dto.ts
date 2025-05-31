import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsObject,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AssetType } from '../enums/asset-type.enum';

export class CreateAssetDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AssetType)
  @IsOptional()
  type?: AssetType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  currentValue: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  purchasePrice?: number;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-100)
  @Max(1000)
  @IsOptional()
  @Type(() => Number)
  annualReturn?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  marketValue?: number;

  @IsDateString()
  @IsOptional()
  valuationDate?: string;

  @IsString()
  @IsOptional()
  liquidityLevel?: string;

  @IsObject()
  @IsOptional()
  additionalInfo?: {
    location?: string;
    condition?: string;
    serialNumber?: string;
    broker?: string;
    accountNumber?: string;
    interestRate?: number;
    maturityDate?: Date;
    dividendYield?: number;
    riskRating?: string;
    [key: string]: any;
  };

  @IsString()
  @IsOptional()
  notes?: string;
}
