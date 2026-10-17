import { ApiProperty } from '@nestjs/swagger';
import { ReportTargetType } from '@prisma/client';
import {
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  @ApiProperty({ enum: ReportTargetType })
  targetType: ReportTargetType;

  @IsUUID()
  @ApiProperty()
  targetId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @ApiProperty()
  reason: string;
}
