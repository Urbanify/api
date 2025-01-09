import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { IssueCategory } from '../entities/issue.entity';

export class CreateIssueDto {
  @IsString()
  @ApiProperty()
  latitude: string;

  @IsString()
  @ApiProperty()
  longitude: string;

  @IsEnum(IssueCategory)
  @ApiProperty({ enum: IssueCategory })
  category: IssueCategory;

  @IsString()
  @ApiProperty()
  description: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ required: false })
  photos?: string[];
}
