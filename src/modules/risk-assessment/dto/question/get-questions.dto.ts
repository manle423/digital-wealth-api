import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { PaginationDto } from '@/shared/mysqldb/dto/pagination.dto';

export class GetQuestionsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  isActive?: string;

  @ValidateIf((req) => req.category !== undefined && req.category !== '')
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'order';
} 