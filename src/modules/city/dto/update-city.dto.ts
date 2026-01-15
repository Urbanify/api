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
  featureFlagId: string;

  @IsBoolean()
  @ApiProperty()
  status: boolean;
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
