import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SigninDto {
  @IsString()
  @ApiProperty()
  cpf: string;

  @IsString()
  @ApiProperty()
  password: string;
}
