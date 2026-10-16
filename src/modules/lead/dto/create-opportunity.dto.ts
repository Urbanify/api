import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export enum OpportunityType {
  NEW = 'nova',
  UPDATE = 'atualizacao',
}

export enum OpportunityStage {
  FIRST_CONTACT = 'primeiro-contato',
  MEETING_SCHEDULED = 'reuniao-marcada',
  MEETING_DONE = 'reuniao-feita',
  PROPOSAL_SENT = 'proposta-enviada',
  PROCESS_OPEN = 'processo-aberto',
  CONTRACT_SIGNED = 'contrato-assinado',
}

export enum ContractPath {
  WAIVER = 'dispensa',
  TENDER = 'pregao',
  DIRECT = 'inexigibilidade',
  CPSI = 'cpsi',
  NOT_SURE = 'nao-sei',
}

export const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

export class CreateOpportunityDto {
  @IsEmail()
  @MaxLength(254)
  @ApiProperty({
    description:
      'Reseller login e-mail, used for the reply and the reservation',
  })
  resellerEmail: string;

  @IsString()
  @Length(2, 160)
  @ApiProperty({ description: 'Reseller company' })
  company: string;

  @IsEnum(OpportunityType)
  @ApiProperty({ enum: OpportunityType })
  type: OpportunityType;

  @IsString()
  @Length(2, 120)
  @ApiProperty()
  city: string;

  @IsIn(BRAZILIAN_STATES)
  @ApiProperty({ enum: BRAZILIAN_STATES })
  uf: string;

  @IsString()
  @Length(2, 120)
  @ApiProperty({
    description: 'Role of the contact at the city hall, never a name',
  })
  contactRole: string;

  @IsEnum(OpportunityStage)
  @ApiProperty({ enum: OpportunityStage })
  stage: OpportunityStage;

  @IsEnum(ContractPath)
  @ApiProperty({ enum: ContractPath })
  path: ContractPath;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional()
  notes?: string;

  // Honeypot: any value is accepted here so bots get the same 202 as humans.
  @IsOptional()
  @ApiPropertyOptional({ description: 'Must stay empty' })
  website?: string;
}
