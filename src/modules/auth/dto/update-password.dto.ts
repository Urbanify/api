import { IsJWT, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsJWT()
  token: string;

  @IsString()
  newPassword: string;

  @IsString()
  newPasswordConfirmation: string;
}
