import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActiveUser, UserType } from '@shared/decorators/active-user.decorator';

import { AuthService } from './auth.service';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { ResetPasswordValidationInterceptor } from './interceptors/reset-password.interceptor';
import { SignupValidationInterceptor } from './interceptors/signup.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Signup an user' })
  @UseInterceptors(SignupValidationInterceptor)
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('/signin')
  @ApiOperation({ summary: 'Signin an user' })
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset an user password' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: ResetPasswordResponseDto })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('/reset-password/confirm')
  @ApiOperation({ summary: 'Confirm the user reset password' })
  @UseInterceptors(ResetPasswordValidationInterceptor)
  confirmResetPassword(
    @Body() confirmResetPasswordDto: ConfirmResetPasswordDto,
    @ActiveUser() user: UserType,
  ) {
    return this.authService.confirmResetPassword(user, confirmResetPasswordDto);
  }
}
