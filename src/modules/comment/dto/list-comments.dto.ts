import { UserRole } from '@modules/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListCommentsFilterDto {
  @IsString()
  @ApiProperty()
  issueId: string;

  @IsString()
  @ApiProperty()
  page: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  take?: number;
}

class CommentAuthorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  cityId?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}

export class ListCommentsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  issueId: string;

  @ApiProperty()
  cityId: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: CommentAuthorResponseDto })
  author: CommentAuthorResponseDto;
}

export class ListCommentsPaginatedResponseDto {
  @ApiProperty({ type: [ListCommentsResponseDto] })
  items: ListCommentsResponseDto[];

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  take: number;
}
