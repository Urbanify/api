import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  cpf: string;
}

export class ResetPasswordResponseDto {
  @IsString()
  @ApiProperty()
  sentTo: string;
}
