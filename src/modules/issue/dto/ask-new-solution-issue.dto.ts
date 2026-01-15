import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AskNewSolutionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The justification for asking a new solution',
    example: 'The problem persists despite the initial fix.',
  })
  description: string;
}
