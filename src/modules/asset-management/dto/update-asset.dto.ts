import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDto } from './create-asset.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 