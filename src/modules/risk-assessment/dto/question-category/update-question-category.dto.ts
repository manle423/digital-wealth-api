import { IsOptional, IsString, IsBoolean, IsInt, IsUUID, Min, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateQuestionCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  codeName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class QuestionCategoryUpdate {
  @IsUUID()
  id: string;

  @IsNotEmpty()
  data: UpdateQuestionCategoryDto;
}

export class UpdateMultipleQuestionCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionCategoryUpdate)
  @ArrayMinSize(1)
  categories: QuestionCategoryUpdate[];
} 