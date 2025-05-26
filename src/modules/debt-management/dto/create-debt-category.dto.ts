import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDebtCategoryDto {
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
  @Type(() => Boolean)
  isActive?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;
}