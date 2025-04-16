import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateQuestionOptionDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  value?: number;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionOptionDto)
  options?: UpdateQuestionOptionDto[];
} 

export class QuestionUpdate {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ValidateNested()
  @Type(() => UpdateQuestionDto)
  data: UpdateQuestionDto;
}

export class UpdateMultipleQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionUpdate)
  questions: QuestionUpdate[];
} 