import { IsJWT, IsString } from 'class-validator';

export class ConfirmResetPasswordDto {
  @IsJWT()
  token: string;

  @IsString()
  newPassword: string;

  @IsString()
  newPasswordConfirmation: string;
}
