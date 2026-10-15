import { ApiProperty } from '@nestjs/swagger';
import { PlaceCategory } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlaceDto {
  @IsString()
  @Length(2, 120)
  @ApiProperty()
  name: string;

  @IsEnum(PlaceCategory)
  @ApiProperty({ enum: PlaceCategory })
  category: PlaceCategory;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiProperty()
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiProperty()
  longitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiProperty({ required: false })
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiProperty({ required: false })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiProperty({ required: false })
  hours?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @ApiProperty({ required: false })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: true })
  published?: boolean;
}
