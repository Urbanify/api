import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PlaceCategory } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

import { CreatePlaceDto } from './create-place.dto';

// PartialType makes every field nullable (IsOptional skips null), and a null
// name or coordinate would reach Prisma as a 500. The required fields below
// may be omitted, but a null value is rejected.
export class UpdatePlaceDto extends PartialType(
  OmitType(CreatePlaceDto, ['name', 'category', 'latitude', 'longitude']),
) {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(2, 120)
  @ApiProperty({ required: false })
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(PlaceCategory)
  @ApiProperty({ required: false, enum: PlaceCategory })
  category?: PlaceCategory;

  @ValidateIf((_, value) => value !== undefined)
  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiProperty({ required: false })
  latitude?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiProperty({ required: false })
  longitude?: number;
}
