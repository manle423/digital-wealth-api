import { IsEnum, IsInt, IsOptional, IsString, Min, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RiskProfileType } from '../../enums/risk-profile.enum';
import { PaginationDto } from '@/shared/mysqldb/dto/pagination.dto';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';

export class GetRiskProfilesDto extends PaginationDto {
  @IsOptional()
  @IsArray()
  @IsEnum(RiskProfileType, { each: true })
  @Transform(({ value }) => {
    // If already an array, keep as is
    if (Array.isArray(value)) {
      return value;
    }
    
    // If comma-separated string, split into array
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map(item => item.trim());
    }
    
    // If single string, convert to array with one element
    if (typeof value === 'string' && value) {
      return [value];
    }
    
    // Otherwise, return empty array
    return [];
  })
  types?: RiskProfileType[];
  
  @IsOptional()
  @IsString()
  sortBy?: string = 'minScore';
  
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.ASC;
} 