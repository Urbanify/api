import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Equals,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export enum ResellerExperience {
  NONE = 'none',
  SOME = 'some',
  STRONG = 'strong',
}

export class CreateResellerLeadDto {
  @IsString()
  @Length(2, 120)
  @ApiProperty()
  name: string;

  @IsEmail()
  @MaxLength(254)
  @ApiProperty()
  email: string;

  @IsString()
  @Length(8, 20)
  @ApiProperty()
  phone: string;

  @IsString()
  @Length(2, 160)
  @ApiProperty({ description: 'Razão social' })
  company: string;

  @Matches(/^\d{14}$/)
  @ApiProperty({ description: 'Digits only' })
  cnpj: string;

  @IsString()
  @Length(2, 160)
  @ApiProperty({ description: 'City and state where the candidate operates' })
  region: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional()
  citiesOfInterest?: string;

  @IsEnum(ResellerExperience)
  @ApiProperty({ enum: ResellerExperience })
  experience: ResellerExperience;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiPropertyOptional()
  howHeard?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional()
  message?: string;

  @Equals(true)
  @ApiProperty({
    description: 'Agreed to be contacted and to the privacy policy',
  })
  consent: boolean;

  // Honeypot: any value is accepted here so bots get the same 202 as humans.
  @IsOptional()
  @ApiPropertyOptional({ description: 'Must stay empty' })
  website?: string;
}
