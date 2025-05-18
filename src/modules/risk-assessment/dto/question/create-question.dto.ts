import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator';

class QuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  textVi: string;

  @IsString()
  @IsNotEmpty()
  textEn: string;

  @IsNumber()
  @Type(() => Number)
  value: number;
}

class NewCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateQuestionDto {
  @IsString()
  textVi: string;

  @IsString()
  textEn: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @ValidateIf(o => !o.categoryId && !o.newCategory)
  @IsString()
  @IsOptional()
  category?: string;

  @ValidateIf(o => !o.category && !o.newCategory)
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ValidateIf(o => !o.category && !o.categoryId)
  @ValidateNested()
  @Type(() => NewCategoryDto)
  @IsOptional()
  newCategory?: NewCategoryDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];
}

export class CreateMultipleQuestionsDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
} 