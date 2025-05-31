import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

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

export class CreateMultipleQuestionCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionCategoryDto)
  @ArrayMinSize(1)
  categories: CreateQuestionCategoryDto[];
}
