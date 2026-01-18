import { ApiProperty } from '@nestjs/swagger';

export enum CrimeCategory {
  VIOLENCE = 'VIOLENCE',
  THEFT = 'THEFT',
  VANDALISM = 'VANDALISM',
  FRAUD = 'FRAUD',
  DRUGS = 'DRUGS',
  TRAFFIC = 'TRAFFIC',
}

export enum CrimeType {
  ASSAULT = 'ASSAULT',
  ROBBERY = 'ROBBERY',
  ARMED_ROBBERY = 'ARMED_ROBBERY',
  THREAT = 'THREAT',
  BURGLARY = 'BURGLARY',
  VEHICLE_THEFT = 'VEHICLE_THEFT',
  PICKPOCKET = 'PICKPOCKET',
  VANDALISM_PROPERTY = 'VANDALISM_PROPERTY',
  GRAFFITI = 'GRAFFITI',
  PUBLIC_DAMAGE = 'PUBLIC_DAMAGE',
  SCAM = 'SCAM',
  DOCUMENT_FRAUD = 'DOCUMENT_FRAUD',
  CARD_FRAUD = 'CARD_FRAUD',
  DRUG_TRAFFICKING = 'DRUG_TRAFFICKING',
  DRUG_USE = 'DRUG_USE',
  TRAFFIC_ACCIDENT = 'TRAFFIC_ACCIDENT',
  DUI = 'DUI',
  DANGEROUS_DRIVING = 'DANGEROUS_DRIVING',
}

export type Paginated<T> = {
  items: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  take: number;
};

export class Crime {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: CrimeCategory })
  category: CrimeCategory;

  @ApiProperty({ enum: CrimeType })
  type: CrimeType;

  @ApiProperty()
  latitude: string;

  @ApiProperty()
  longitude: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  details: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
