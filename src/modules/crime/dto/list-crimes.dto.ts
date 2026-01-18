import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

import { Crime, CrimeCategory } from '../entities/crime.entity';

export class ListCrimesFilterDto {
  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional()
  start?: Date;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional()
  end?: Date;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiPropertyOptional()
  page: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  @ApiPropertyOptional()
  take?: number;

  @IsEnum(CrimeCategory)
  @IsOptional()
  @ApiPropertyOptional({ enum: CrimeCategory })
  category?: CrimeCategory;
}

export class ListCrimeResponseDto {
  @ApiProperty({ type: [Crime] })
  items: Crime[];

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  take: number;
}
