import { ApiProperty } from '@nestjs/swagger';
import { BuildingStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Sunset Residencial' })
  @IsString()
  name: string;

  @ApiProperty({ example: '-23.550520' })
  @IsString()
  latitude: string;

  @ApiProperty({ example: '-46.633308' })
  @IsString()
  longitude: string;

  @ApiProperty({ enum: BuildingStatus, example: BuildingStatus.STARTED })
  @IsEnum(BuildingStatus)
  status: BuildingStatus;

  @ApiProperty({ example: '1500000.00' })
  @IsString()
  value: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-12-31T00:00:00Z' })
  @IsDateString()
  expectedEndDate: string;

  @ApiProperty({ example: '2025-10-31T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 45.5, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage: number;

  @ApiProperty({ example: 'Construtora XYZ' })
  @IsString()
  company: string;

  @ApiProperty({ example: ['https://example.com/photo1.jpg'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  photos: string[];
}
