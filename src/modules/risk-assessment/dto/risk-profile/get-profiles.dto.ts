import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RiskProfileType } from '../../enums/risk-profile.enum';
import { PaginationDto } from '@/shared/mysqldb/dto/pagination.dto';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';

export class GetRiskProfilesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(RiskProfileType)
  type?: RiskProfileType;
  
  @IsOptional()
  @IsString()
  sortBy?: string = 'minScore';
  
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.ASC;
} 