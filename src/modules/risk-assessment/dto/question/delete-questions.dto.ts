import { IsArray, IsUUID } from 'class-validator';

export class DeleteQuestionsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  ids: string[];
}
