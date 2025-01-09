import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { IssueCategory, IssueStatus } from '../entities/issue.entity';

class History {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  userId: string;

  @IsString()
  @ApiProperty()
  action: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;

  @IsString()
  @ApiProperty()
  createdAt: Date;

  @IsString()
  @ApiProperty()
  updatedAt: Date;
}

export class GetIssueByIdResponseDto {
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

  @ApiProperty({ type: [History] })
  history: History[];

  @ApiProperty()
  photos: string[];
}
