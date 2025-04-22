import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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

export class CreateQuestionDto {
  @IsString()
  textVi: string;

  @IsString()
  textEn: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsString()
  @IsNotEmpty()
  category: string;

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