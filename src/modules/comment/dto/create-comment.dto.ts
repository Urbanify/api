import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @ApiProperty()
  text: string;

  @IsString()
  @ApiProperty()
  issueId: string;

  @IsString()
  @ApiProperty()
  cityId: string;
}
