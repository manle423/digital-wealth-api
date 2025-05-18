import { IsOptional, IsString, IsArray } from 'class-validator';
import { PaginationDto } from '@/shared/mysqldb/dto/pagination.dto';
import { Transform } from 'class-transformer';

export class GetQuestionsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Nếu là mảng sẵn, giữ nguyên
    if (Array.isArray(value)) {
      return value;
    }
    
    // Nếu là chuỗi ngăn cách bởi dấu phẩy, tách thành mảng
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map(item => item.trim());
    }
    
    // Nếu là chuỗi đơn, chuyển thành mảng một phần tử
    if (typeof value === 'string') {
      return [value];
    }
    
    // Trường hợp khác, trả về mảng rỗng
    return [];
  })
  categories?: string[];

  @IsOptional()
  @IsString()
  sortBy?: string = 'order';
} 