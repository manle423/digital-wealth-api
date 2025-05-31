import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '@/shared/mysqldb/dto/pagination.dto';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';

export class GetQuestionCategoriesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

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
