import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateCityDto } from './create-city.dto';
import { CityStatus } from '../entities/city.entity';

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
  @IsEnum(CityStatus)
  @ApiProperty()
  status: CityStatus;

  @ApiProperty({ type: [FeatureFlag] })
  @Type(() => FeatureFlag)
  @ValidateNested()
  @IsNotEmpty()
  featureFlags: FeatureFlag[];
}
