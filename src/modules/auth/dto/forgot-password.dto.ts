import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @ApiProperty()
  cpf: string;
}

export class ForgotPasswordResponseDto {
  @IsString()
  @ApiProperty()
  sentTo: string;
}
