import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SubmitFeedbackDto {
  @IsString()
  feedback: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}
