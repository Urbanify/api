import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CloseIssueDto {
  @IsString()
  @ApiProperty()
  description: string;
}
