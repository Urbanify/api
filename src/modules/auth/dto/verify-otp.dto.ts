import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @Matches(/^\d{6}$/)
  @ApiProperty()
  code: string;
}
