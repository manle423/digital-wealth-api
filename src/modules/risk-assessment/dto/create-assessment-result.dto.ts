import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
  @IsUUID()
  id: string;

  @IsString()
  text: string;

  @IsString()
  category: string;
}

class AnswerDto {
  @IsString()
  text: string;

  @IsInt()
  value: number;
}

class UserResponseDto {
  @IsObject()
  @ValidateNested()
  @Type(() => QuestionDto)
  question: QuestionDto;

  @IsObject()
  @ValidateNested()
  @Type(() => AnswerDto)
  answer: AnswerDto;
}

export class CreateAssessmentResultDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsInt()
  totalScore: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserResponseDto)
  userResponses: UserResponseDto[];
}
