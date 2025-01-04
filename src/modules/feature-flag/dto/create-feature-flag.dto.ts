import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFeatureFlagDto {
  @IsString()
  @ApiProperty()
  slug: string;

  @IsString()
  @ApiProperty()
  description: string;
}
