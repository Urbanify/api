import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptIssueDto {
  @IsString()
  @ApiProperty()
  description: string;
}
