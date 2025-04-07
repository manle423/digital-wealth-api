import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { UpdateQuestionDto } from './update-question.dto';

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