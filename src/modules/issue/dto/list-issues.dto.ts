import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import {
  IssueCategory,
  IssueStatus,
  IssueType,
} from '../entities/issue.entity';

export class ListIssuesFilterDto {
  @IsString()
  @ApiProperty()
  start: Date;

  @IsString()
  @ApiProperty()
  end: Date;

  @IsString()
  @ApiProperty()
  page: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  take?: number;

  @IsEnum(IssueStatus)
  @IsOptional()
  @ApiProperty({ enum: IssueStatus, required: false })
  status?: IssueStatus;

  @IsEnum(IssueCategory)
  @IsOptional()
  @ApiProperty({ enum: IssueCategory, required: false })
  category?: IssueCategory;
}

export class ListIssuesResponseDto {
  @ApiProperty()
  id: string;

  @IsEnum(IssueStatus)
  @ApiProperty({ enum: IssueStatus })
  status: IssueStatus;

  @ApiProperty()
  cityId: string;

  @ApiProperty()
  latitude: string;

  @ApiProperty()
  longitude: string;

  @IsEnum(IssueCategory)
  @ApiProperty({ enum: IssueCategory })
  category: IssueCategory;

  @IsEnum(IssueType)
  @ApiProperty({ enum: IssueType })
  type: IssueType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  reporterId: string;

  @ApiProperty({ required: false })
  fiscalId?: string;

  @ApiProperty({ required: false })
  managerId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
