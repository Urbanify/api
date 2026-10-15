import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class SignupDto {
  @IsString()
  @ApiProperty({
    description:
      'Returned by POST /auth/otp/verify when the email has no account',
  })
  signupToken: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  surname: string;

  @IsUUID()
  @ApiProperty()
  cityId: string;
}
