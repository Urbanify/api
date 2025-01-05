import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateCityDto } from './create-city.dto';

class FeatureFlag {
  @IsString()
  @ApiProperty()
  cityId: string;

  @IsString()
  @ApiProperty()
  featureFlagId: string;

  @IsString()
  @ApiProperty()
  slug: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsBoolean()
  @ApiProperty()
  status: boolean;

  @IsString()
  @ApiProperty()
  createdAt: Date;

  @IsString()
  @ApiProperty()
  updatedAt: Date;
}

export class UpdateCityDto extends CreateCityDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean;

  @ApiProperty({ type: [FeatureFlag] })
  @Type(() => FeatureFlag)
  @ValidateNested()
  @IsNotEmpty()
  featureFlags: FeatureFlag[];
}
