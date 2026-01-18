import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsString } from 'class-validator';

import { CrimeCategory, CrimeType } from '../entities/crime.entity';

export class CreateCrimeDto {
  @IsEnum(CrimeCategory)
  @ApiProperty({ enum: CrimeCategory })
  category: CrimeCategory;

  @IsEnum(CrimeType)
  @ApiProperty({ enum: CrimeType })
  type: CrimeType;

  @IsString()
  @ApiProperty()
  latitude: string;

  @IsString()
  @ApiProperty()
  longitude: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsDateString()
  @ApiProperty()
  date: Date;

  @IsString()
  @ApiProperty()
  details: string;
}
