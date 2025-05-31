import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';

export class PaginationDto {
  @ValidateIf((req) => req.page)
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ValidateIf((req) => req.page)
  @Type(() => Number)
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.ASC;
}
