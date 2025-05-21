import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/shared/mysqldb/dto/pagination.dto';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';

export class GetAssetClassesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  isActive?: string;
  
  @IsOptional()
  @IsString()
  sortBy?: string = 'order';
  
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.ASC;
} 