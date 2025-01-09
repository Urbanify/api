import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResolutionIssueDto {
  @IsString()
  @ApiProperty()
  description: string;
}
