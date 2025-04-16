import { IsArray, IsUUID } from 'class-validator';

export class DeleteRiskProfilesDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  ids: string[];
} 