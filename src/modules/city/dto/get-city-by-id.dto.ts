import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

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

export class GetCityByIdResponseDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  latitude: string;

  @IsString()
  @ApiProperty()
  longitude: string;

  @IsString()
  @ApiProperty()
  status: boolean;

  @IsString()
  @ApiProperty()
  createdAt: Date;

  @IsString()
  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [FeatureFlag] })
  featureFlags: FeatureFlag[];
}
